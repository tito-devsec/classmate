import { Link } from "react-router-dom";
import { BarChart3 } from "lucide-react";
import { useCompareIds } from "@/lib/compare";
import { useT } from "@/i18n";

/** Floating shortlist counter — the way back to the compare page from anywhere. */
export function CompareWidget() {
  const ids = useCompareIds();
  const t = useT();

  return (
    <Link
      to="/linganisha"
      aria-label={t("compare.widgetLabel", { n: ids.length })}
      className="fixed bottom-4 right-4 z-40 flex h-[62px] w-[62px] flex-col items-center justify-center gap-0.5 rounded-xl bg-card text-primary shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.24)]"
    >
      <span className="text-[15px] font-semibold leading-none">({ids.length})</span>
      <BarChart3 className="h-[22px] w-[22px]" strokeWidth={2.5} />
    </Link>
  );
}
