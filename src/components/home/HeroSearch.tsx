import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Map, MapPin, Search, Wallet } from "lucide-react";

interface HeroSearchProps {
  regions: { name: string; schoolCount: number }[];
}

const budgets = [
  { label: "Ada yoyote", value: "" },
  { label: "Chini ya TZS 1M", value: "0-1000000" },
  { label: "TZS 1M – 2.5M", value: "1000000-2500000" },
  { label: "TZS 2.5M – 4M", value: "2500000-4000000" },
  { label: "Zaidi ya TZS 4M", value: "4000000-20000000" },
];

/**
 * The one control the home page is built around: a single dark bar holding two segmented
 * selects and the search action, so a parent can go from landing to results in one gesture.
 */
export function HeroSearch({ regions }: HeroSearchProps) {
  const [region, setRegion] = useState("");
  const [budget, setBudget] = useState("");
  const navigate = useNavigate();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (budget) {
      const [minFee, maxFee] = budget.split("-");
      params.set("minFee", minFee);
      params.set("maxFee", maxFee);
    }
    navigate(params.toString() ? `/shule?${params}` : "/shule");
  };

  return (
    <div className="mx-auto w-full max-w-[920px]">
      <form
        onSubmit={submit}
        className="flex flex-col gap-2 rounded-[28px] bg-secondary p-2 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:rounded-full"
      >
        {/* Region */}
        <label className="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-full bg-card px-4 py-3 sm:py-3.5">
          <MapPin className="h-[18px] w-[18px] shrink-0 text-foreground/70" />
          <span className="sr-only">Mkoa</span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="w-full appearance-none bg-transparent pr-6 text-[0.9375rem] font-medium text-foreground outline-none"
          >
            <option value="">Mkoa wowote 🇹🇿</option>
            {regions.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name}
                {entry.schoolCount > 0 ? ` (${entry.schoolCount})` : ""}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-muted-foreground" />
        </label>

        {/* Budget */}
        <label className="relative flex min-w-0 flex-1 items-center gap-2.5 rounded-full bg-card px-4 py-3 sm:py-3.5">
          <Wallet className="h-[18px] w-[18px] shrink-0 text-foreground/70" />
          <span className="sr-only">Ada kwa mwaka</span>
          <select
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className="w-full appearance-none bg-transparent pr-6 text-[0.9375rem] font-medium text-foreground outline-none"
          >
            {budgets.map((entry) => (
              <option key={entry.label} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 h-4 w-4 text-muted-foreground" />
        </label>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary/90 sm:py-4"
        >
          <Search className="h-4 w-4" />
          Tafuta
        </button>
      </form>

      <div className="mt-7 text-center">
        <p className="font-display text-[0.9375rem] font-bold text-foreground">
          Au jaribu ramani yetu mpya ya shule
        </p>
        <button
          type="button"
          onClick={() => navigate("/shule?view=ramani")}
          className="group mx-auto mt-3 flex items-center gap-3 rounded-full border border-primary/25 bg-card py-1.5 pl-1.5 pr-6 transition hover:border-primary/60"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Map className="h-5 w-5" />
          </span>
          <span className="text-[0.9375rem] font-medium text-foreground">Ona shule kwenye ramani</span>
        </button>
      </div>
    </div>
  );
}
