import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Edge tab that opens a short feedback note. Feedback posts to the enquiry endpoint once the
 * backend exposes one; until then it thanks the sender and keeps the note in this browser.
 */
export function FeedbackTab() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    try {
      const existing = JSON.parse(localStorage.getItem("classmate.feedback") ?? "[]");
      localStorage.setItem(
        "classmate.feedback",
        JSON.stringify([{ message: message.trim(), at: new Date().toISOString() }, ...existing]),
      );
    } catch {
      /* private mode — the note simply is not kept */
    }
    setMessage("");
    setOpen(false);
    toast.success("Asante kwa maoni yako!");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-l-xl bg-primary/12 px-2 py-5 text-primary transition hover:bg-primary/20 lg:flex"
        style={{ writingMode: "vertical-rl" }}
        aria-label="Toa maoni"
      >
        <MessageSquare className="h-4 w-4 rotate-90" />
        <span className="text-[13px] font-semibold tracking-wide">Maoni</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Tuambie unavyoona</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Nini kingerahisisha kutafuta shule hapa?
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Funga" className="rounded-full p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={send} className="mt-4">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                placeholder="Andika maoni yako hapa…"
                className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none ring-primary/25 focus:ring-2"
              />
              <button
                type="submit"
                className="mt-3 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Tuma maoni
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
