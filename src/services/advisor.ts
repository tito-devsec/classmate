import { apiUrl } from "@/lib/api";

export type ChatRole = "user" | "assistant";
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface StreamOptions {
  messages: ChatMessage[];
  mode?: string;
  schoolContext?: string;
  signal?: AbortSignal;
  onDelta: (chunk: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

/** Whether the backend has an AI provider configured. */
export async function advisorEnabled(): Promise<boolean> {
  try {
    const response = await fetch(apiUrl("/api/advisor/status"));
    if (!response.ok) return false;
    const payload = await response.json();
    return Boolean(payload?.data?.enabled);
  } catch {
    return false;
  }
}

/**
 * Streams a reply from `POST /api/advisor/chat`.
 *
 * The endpoint forwards the provider's server-sent events untouched, so this parses the
 * OpenAI-compatible `data: {...}` frames and emits content deltas as they arrive.
 */
export async function streamAdvisor({
  messages,
  mode,
  schoolContext,
  signal,
  onDelta,
  onDone,
  onError,
}: StreamOptions): Promise<void> {
  let response: Response;

  try {
    response = await fetch(apiUrl("/api/advisor/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, mode, schoolContext }),
      signal,
    });
  } catch {
    onError("Tatizo la mtandao. Tafadhali jaribu tena.");
    return;
  }

  if (!response.ok || !response.body) {
    const payload = await response.json().catch(() => null);
    onError(payload?.error ?? "Mshauri hapatikani kwa sasa. Jaribu tena baadaye.");
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newline: number;
      while ((newline = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;

        const json = line.slice(6).trim();
        if (json === "[DONE]") {
          onDone();
          return;
        }
        try {
          const delta = JSON.parse(json)?.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
        } catch {
          // Partial frame — put it back and wait for the rest of the chunk.
          buffer = `${line}\n${buffer}`;
          break;
        }
      }
    }
    onDone();
  } catch {
    onError("Mazungumzo yamekatika. Jaribu tena.");
  }
}
