import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { schools, colleges, formatTZS } from "@/data/schools";
import { streamAdvisor, type ChatMessage } from "@/services/advisor";
import { useT } from "@/i18n";

type Msg = ChatMessage;

function getSchoolContext(pathname: string): { mode: string; schoolContext?: string } | null {
  // School profile: /shule/:id
  const schoolMatch = pathname.match(/^\/shule\/([^/]+)$/);
  if (schoolMatch) {
    const school = schools.find((s) => s.id === schoolMatch[1]);
    if (school) {
      return {
        mode: "school-profile",
        schoolContext: `Jina: ${school.name}\nEneo: ${school.location} (${school.region})\nAina: ${school.boardingDay}\nJinsia: ${school.gender}\nLevel: ${school.levels.join(", ")}\nAda: ${formatTZS(school.tuitionMin)} - ${formatTZS(school.tuitionMax)}\nRating: ${school.rating}/5\nDiv I: ${school.performance.divisionI}%\nVifaa: ${school.facilities.join(", ")}\nSimu: ${school.phone}`,
      };
    }
  }
  // College profile: /chuo/:id
  const collegeMatch = pathname.match(/^\/chuo\/([^/]+)$/);
  if (collegeMatch) {
    const college = colleges.find((c) => c.id === collegeMatch[1]);
    if (college) {
      return {
        mode: "school-profile",
        schoolContext: `Jina: ${college.name}\nEneo: ${college.location} (${college.region})\nAina: ${college.type}\nCategory: ${college.category}\nAda: ${formatTZS(college.tuitionMin)} - ${formatTZS(college.tuitionMax)}\nRating: ${college.rating}/5\nProgramu: ${college.programs.join(", ")}\nSimu: ${college.phone}`,
      };
    }
  }
  return null;
}


export const AIChatBubble = () => {
  const location = useLocation();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [lastPath, setLastPath] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Detect context from current route
  const ctx = getSchoolContext(location.pathname);

  // Reset conversation when navigating to a different school
  useEffect(() => {
    if (location.pathname !== lastPath) {
      setLastPath(location.pathname);
      if (hasGreeted) {
        setMessages([]);
        setHasGreeted(false);
      }
    }
  }, [location.pathname]);

  // Listen for external open event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-ai-chat', handler);
    return () => window.removeEventListener('open-ai-chat', handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Greeting on open
  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      setLoading(true);
      let assistantSoFar = "";
      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant")
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      const greetMsg = ctx
        ? t("chat.greetSchool")
        : t("chat.greetGeneral");

      streamAdvisor({
        messages: [{ role: "user", content: greetMsg }],
        mode: ctx?.mode,
        schoolContext: ctx?.schoolContext,
        onDelta: upsert,
        onDone: () => setLoading(false),
        onError: (e) => {
          setMessages([{ role: "assistant", content: e }]);
          setLoading(false);
        },
      });
    }
  }, [open, hasGreeted]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: input.trim() };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && !last.content.includes(userMsg.content))
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    await streamAdvisor({
      messages: allMsgs,
      mode: ctx?.mode,
      schoolContext: ctx?.schoolContext,
      onDelta: upsert,
      onDone: () => setLoading(false),
      onError: (e) => {
        setMessages((prev) => [...prev, { role: "assistant", content: e }]);
        setLoading(false);
      },
    });
  };

  // Dynamic bubble text based on context
  const bubbleText = ctx ? t("chat.bubbleSchool") : t("chat.bubbleGeneral");

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-[84px] z-50 flex items-center gap-2 rounded-full border border-primary/30 bg-card/95 px-4 py-3 text-primary shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-primary/10 hover:shadow-xl sm:px-5"
          aria-label={t("chat.open")}
        >
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping-slow" />
            <MessageCircle className="relative h-5 w-5" />
          </span>
          <span className="hidden text-sm font-semibold sm:inline">{bubbleText}</span>
        </button>
      )}

      {/* Chat widget */}
      {open && (
        <div className="fixed bottom-3 right-3 z-50 flex h-[400px] w-[300px] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl animate-scale-in sm:bottom-5 sm:right-5 sm:h-[480px] sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-background/80 backdrop-blur-md border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t("chat.title")}</p>
                <p className="text-[10px] text-muted-foreground">{t("chat.subtitle")}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 text-muted-foreground hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && !loading && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MessageCircle className="h-10 w-10 text-primary/30" />
                <p className="mt-2 text-sm font-medium text-foreground">{t("chat.welcome")}</p>
                <p className="text-xs text-muted-foreground">{t("chat.waiting")}</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick actions for school profile */}
          {ctx && messages.length > 0 && !loading && (
            <div className="flex gap-2 px-3 pb-2 overflow-x-auto">
              <button
                onClick={() => { setInput(t("chat.quickFindValue")); }}
                className="whitespace-nowrap rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                {t("chat.quickFind")}
              </button>
              <button
                onClick={() => { setInput(t("chat.quickFeesValue")); }}
                className="whitespace-nowrap rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                {t("chat.quickFees")}
              </button>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 border-t px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat.placeholder")}
              className="flex-1 rounded-full bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};
