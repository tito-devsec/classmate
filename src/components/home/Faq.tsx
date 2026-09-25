import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/translations";

const questions: { q: TranslationKey; a: TranslationKey }[] = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
];

/** Question list with dashed rules and square toggles. */
export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const t = useT();

  return (
    <section className="py-16">
      <div className="wrap">
        <p className="eyebrow">{t("faq.eyebrow")}</p>
        <h2 className="display-lg mt-3 text-foreground">{t("faq.title")}</h2>

        <div className="mt-10 rule-dashed">
          {questions.map((entry, index) => {
            const expanded = open === index;
            return (
              <div key={entry.q} className="border-b border-dashed border-[#666]">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-6 py-7 text-left"
                >
                  <span className="text-[16px] font-semibold text-foreground">{t(entry.q)}</span>
                  <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-lg bg-[#e9e9e9] text-foreground transition hover:bg-[#dedede]">
                    {expanded ? <Minus className="h-6 w-6" strokeWidth={2.5} /> : <Plus className="h-6 w-6" strokeWidth={2.5} />}
                  </span>
                </button>
                {expanded && <p className="max-w-3xl pb-7 text-[16px] leading-[1.7] text-foreground">{t(entry.a)}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
