import { useEffect, useState } from "react";
import { Headset, X } from "lucide-react";
import { toast } from "sonner";
import { RatingFace } from "@/components/icons";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/translations";

type Mood = 1 | 2 | 3 | 4 | 5;

const SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MOODS: Mood[] = [1, 2, 3, 4, 5];
const STORE_KEY = "classmate.feedback";

interface AnswersState {
  ease: number | null;
  usefulness: number | null;
  speed: Mood | null;
  improve: string;
  email: string;
  anonymous: boolean;
}

const blank: AnswersState = {
  ease: null,
  usefulness: null,
  speed: null,
  improve: "",
  email: "",
  anonymous: false,
};

/**
 * Site-wide feedback survey, opened from the tab pinned to the right edge.
 *
 * There is no feedback endpoint in the Phase 1 API yet, so a completed response is kept in
 * this browser under `classmate.feedback`. Point `send` at the endpoint once it exists —
 * the payload is already the shape a survey table wants.
 */
export function FeedbackTab() {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<AnswersState>(blank);
  const [showErrors, setShowErrors] = useState(false);
  const t = useT();

  const set = <K extends keyof AnswersState>(key: K, value: AnswersState[K]) =>
    setAnswers((current) => ({ ...current, [key]: value }));

  // Escape closes, and the page behind should not scroll while the survey is up.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setShowErrors(false);
  };

  const send = (event: React.FormEvent) => {
    event.preventDefault();

    if (answers.ease === null || answers.usefulness === null || answers.speed === null) {
      setShowErrors(true);
      toast.error(t("feedback.required"));
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
      localStorage.setItem(
        STORE_KEY,
        JSON.stringify([
          {
            ease: answers.ease,
            usefulness: answers.usefulness,
            speed: answers.speed,
            improve: answers.improve.trim() || null,
            email: answers.anonymous ? null : answers.email.trim() || null,
            anonymous: answers.anonymous,
            page: window.location.pathname,
            at: new Date().toISOString(),
          },
          ...existing,
        ]),
      );
    } catch {
      /* private mode — the response is not kept, the thank-you still stands */
    }

    setAnswers(blank);
    close();
    toast.success(t("feedback.thanks"));
  };

  /** A question heading with its red required marker and two-digit index. */
  const heading = (index: string, key: TranslationKey, missing: boolean) => (
    <h3 className={`text-[17px] font-bold ${missing ? "text-destructive" : "text-foreground"}`}>
      <span className="text-primary">*</span> {index}. {t(key)}
    </h3>
  );

  const scaleRow = (
    value: number | null,
    onPick: (value: number) => void,
    lowKey: TranslationKey,
    highKey: TranslationKey,
  ) => (
    <>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10 sm:gap-2.5">
        {SCALE.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onPick(option)}
            aria-label={t("feedback.rateLabel", { n: option })}
            aria-pressed={value === option}
            className={`h-[52px] rounded-lg border text-[16px] transition ${
              value === option
                ? "border-primary bg-primary font-semibold text-primary-foreground"
                : "border-[#d9d9d9] bg-card text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[14px] text-muted-foreground">
        <span>{t(lowKey)}</span>
        <span>{t(highKey)}</span>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-[36%] z-30 hidden w-[34px] flex-col items-center gap-3 rounded-l-lg bg-[#f4d9dd] py-5 text-primary shadow-sm transition hover:bg-[#f0cdd2] md:flex"
        aria-label={t("feedback.tab")}
      >
        <span className="text-[15px] font-semibold tracking-wide" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {t("feedback.tab")}
        </span>
        <Headset className="h-4 w-4" strokeWidth={2.25} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t("feedback.title")}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <form
            onSubmit={send}
            className="relative mx-auto w-full max-w-[760px] bg-card p-6 shadow-2xl sm:rounded-lg sm:p-12"
          >
            <button
              type="button"
              onClick={close}
              aria-label={t("feedback.close")}
              className="absolute left-4 top-4 rounded p-1 text-foreground transition hover:text-primary"
            >
              <X className="h-7 w-7" strokeWidth={2.5} />
            </button>

            <header className="mt-8">
              <h2 className="text-[30px] font-bold leading-tight text-primary sm:text-[38px]">{t("feedback.title")}</h2>
              <p className="mt-2 text-[16px] text-foreground">{t("feedback.subtitle")}</p>
            </header>

            {/* 01 — ease of finding information */}
            <section className="mt-10">
              {heading("01", "feedback.q1", showErrors && answers.ease === null)}
              <p className="mt-2 pl-4 text-[16px] text-foreground">{t("feedback.q1Hint")}</p>
              <div className="pl-4">
                {scaleRow(answers.ease, (value) => set("ease", value), "feedback.q1Low", "feedback.q1High")}
              </div>
            </section>

            {/* 02 — usefulness */}
            <section className="mt-9">
              {heading("02", "feedback.q2", showErrors && answers.usefulness === null)}
              <div className="pl-4">
                {scaleRow(
                  answers.usefulness,
                  (value) => set("usefulness", value),
                  "feedback.q2Low",
                  "feedback.q2High",
                )}
              </div>
            </section>

            {/* 03 — how the speed feels */}
            <section className="mt-9">
              {heading("03", "feedback.q3", showErrors && answers.speed === null)}
              <div className="mt-5 flex flex-wrap justify-around gap-3 pl-4 sm:justify-start sm:gap-8">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => set("speed", mood)}
                    aria-label={t("feedback.moodLabel", { n: mood })}
                    aria-pressed={answers.speed === mood}
                    className={`rounded-full transition ${
                      answers.speed === mood ? "text-primary" : "text-[#c9c9c9] hover:text-foreground/60"
                    }`}
                  >
                    <RatingFace level={mood} />
                  </button>
                ))}
              </div>
            </section>

            {/* Open comment */}
            <section className="mt-12">
              <h3 className="text-[17px] font-bold text-foreground">
                {t("feedback.improve")}{" "}
                <span className="font-normal text-muted-foreground">{t("feedback.optional")}</span>
              </h3>
              <textarea
                rows={5}
                value={answers.improve}
                onChange={(event) => set("improve", event.target.value)}
                placeholder={t("feedback.placeholder")}
                className="mt-4 w-full resize-y rounded-lg border border-[#cfcfcf] bg-card p-4 text-[16px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
              />
            </section>

            {/* Who sent it */}
            <section className="mt-8">
              <h3 className="text-[17px] font-bold text-foreground">{t("feedback.emailLabel")}</h3>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
                <input
                  type="email"
                  value={answers.email}
                  disabled={answers.anonymous}
                  onChange={(event) => set("email", event.target.value)}
                  placeholder={t("feedback.emailPlaceholder")}
                  className="h-11 w-full border-0 border-b border-[#cfcfcf] bg-transparent px-0 text-[16px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:opacity-40 sm:max-w-[320px]"
                />
                <label className="flex cursor-pointer items-center gap-2.5 text-[16px] text-foreground">
                  <input
                    type="checkbox"
                    checked={answers.anonymous}
                    onChange={(event) => set("anonymous", event.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  {t("feedback.anonymous")}
                </label>
              </div>
            </section>

            <footer className="mt-10 flex justify-end gap-4">
              <button
                type="button"
                onClick={close}
                className="h-[52px] rounded-lg bg-[#b3b3b3] px-10 text-[16px] font-semibold text-white transition hover:bg-[#a5a5a5]"
              >
                {t("feedback.notNow")}
              </button>
              <button
                type="submit"
                className="h-[52px] rounded-lg bg-primary px-12 text-[16px] font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                {t("feedback.send")}
              </button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
