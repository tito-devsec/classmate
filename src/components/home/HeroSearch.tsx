import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Map, MapPin, Search } from "lucide-react";
import { FlagTZ, MoneyBag } from "@/components/icons";
import { useT } from "@/i18n";

interface HeroSearchProps {
  regions: { name: string; schoolCount: number }[];
  /** Set when the bar sits on photography — text below it turns white and the bar gets a hairline. */
  onDark?: boolean;
}

type Panel = "region" | "fee" | null;

const feeBands = [
  { label: "< TZS 1M", value: "0-1000000" },
  { label: "TZS 1M – 2M", value: "1000000-2000000" },
  { label: "TZS 2M – 3M", value: "2000000-3000000" },
  { label: "TZS 3M – 4M", value: "3000000-4000000" },
  { label: "TZS 4M – 5M", value: "4000000-5000000" },
  { label: "TZS 5M – 7M", value: "5000000-7000000" },
  { label: "> TZS 7M", value: "7000000-50000000" },
];

/** Faint street grid behind the map button, drawn once as an SVG data URI. */
const MAP_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='64' viewBox='0 0 120 64'%3E%3Crect width='120' height='64' fill='%23f7f7f5'/%3E%3Cg stroke='%23dedede' stroke-width='2' fill='none'%3E%3Cpath d='M0 20h120M0 44h120M24 0v64M64 0v64M98 0v64'/%3E%3C/g%3E%3Cg stroke='%23cfcfcf' stroke-width='4' fill='none'%3E%3Cpath d='M-10 58 130 6'/%3E%3C/g%3E%3Cg fill='%23e9e9e6'%3E%3Crect x='30' y='24' width='26' height='14' rx='2'/%3E%3Crect x='70' y='4' width='20' height='10' rx='2'/%3E%3Crect x='104' y='26' width='12' height='12' rx='2'/%3E%3C/g%3E%3C/svg%3E\")";

/**
 * The search bar the home page is built around: a dark pill holding two segmented pickers
 * and the search action. Each picker opens a white panel beneath the bar while the rest of
 * the page dims, so the choice is made in place.
 */
export function HeroSearch({ regions, onDark = false }: HeroSearchProps) {
  const [panel, setPanel] = useState<Panel>(null);
  const [region, setRegion] = useState("");
  const [fee, setFee] = useState("");
  const navigate = useNavigate();
  const t = useT();

  const toggle = (next: Panel) => setPanel((current) => (current === next ? null : next));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (region) params.set("region", region);
    if (fee) {
      const [minFee, maxFee] = fee.split("-");
      params.set("minFee", minFee);
      params.set("maxFee", maxFee);
    }
    navigate(params.toString() ? `/shule?${params}` : "/shule");
  };

  const chip = (active: boolean) =>
    `rounded-md border px-4 py-2 text-[15px] transition ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-[#cfcfcf] bg-card text-foreground hover:border-primary hover:text-primary"
    }`;

  const feeLabel = feeBands.find((band) => band.value === fee)?.label;

  return (
    <>
      {panel && (
        <button
          type="button"
          aria-label={t("search.close")}
          onClick={() => setPanel(null)}
          className="fixed inset-0 z-[45] cursor-default bg-black/45"
        />
      )}

      <div className="relative z-[46] mx-auto w-full max-w-[920px]">
        <form
          onSubmit={submit}
          className={`flex flex-col gap-2 rounded-[36px] bg-secondary p-2 sm:flex-row sm:items-center sm:rounded-full ${
            onDark ? "shadow-[0_18px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/25" : ""
          }`}
        >
          {/* Region */}
          <button
            type="button"
            onClick={() => toggle("region")}
            aria-expanded={panel === "region"}
            className={`flex h-[66px] flex-1 items-center gap-2.5 rounded-full bg-card px-5 text-left text-[16px] text-foreground ${
              panel === "region" ? "ring-2 ring-primary/40" : ""
            }`}
          >
            <MapPin className="h-[18px] w-[18px] shrink-0" strokeWidth={2.25} />
            <span className="truncate">{region || t("search.region")}</span>
            {!region && <FlagTZ className="h-[14px] w-[20px] shrink-0" />}
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[12px] font-semibold text-white">{t("search.new")}</span>
            <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
          </button>

          {/* Fees */}
          <button
            type="button"
            onClick={() => toggle("fee")}
            aria-expanded={panel === "fee"}
            className={`flex h-[66px] flex-1 items-center gap-2.5 rounded-full bg-card px-5 text-left text-[16px] text-foreground ${
              panel === "fee" ? "ring-2 ring-primary/40" : ""
            }`}
          >
            <MoneyBag className="h-[18px] w-[18px] shrink-0" />
            <span className="truncate">{feeLabel || t("search.fees")}</span>
            <ChevronDown className="ml-auto h-4 w-4 shrink-0" />
          </button>

          <button
            type="submit"
            className="flex h-[66px] flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[16px] font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Search className="h-4 w-4" strokeWidth={2.75} />
            {t("search.submit")}
          </button>
        </form>

        {panel && (
          <div className="absolute inset-x-0 top-[calc(100%+6px)] rounded-2xl bg-card p-7 shadow-[0_18px_50px_rgba(0,0,0,0.25)] sm:p-8">
            <p className="flex items-center gap-2 text-[16px] font-semibold text-foreground">
              {panel === "region" ? (
                <>
                  <MapPin className="h-[18px] w-[18px]" strokeWidth={2.25} /> {t("search.region")}
                </>
              ) : (
                <>
                  <MoneyBag className="h-[18px] w-[18px]" /> {t("search.feesTitle")}
                </>
              )}
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {panel === "region" ? (
                <>
                  <button type="button" className={chip(!region)} onClick={() => { setRegion(""); setPanel(null); }}>
                    {t("search.allRegions")}
                  </button>
                  {regions.map((entry) => (
                    <button
                      key={entry.name}
                      type="button"
                      className={chip(region === entry.name)}
                      onClick={() => {
                        setRegion(entry.name);
                        setPanel(null);
                      }}
                    >
                      {entry.name}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <button type="button" className={chip(!fee)} onClick={() => { setFee(""); setPanel(null); }}>
                    {t("search.anyFee")}
                  </button>
                  {feeBands.map((band) => (
                    <button
                      key={band.value}
                      type="button"
                      className={chip(fee === band.value)}
                      onClick={() => {
                        setFee(band.value);
                        setPanel(null);
                      }}
                    >
                      {band.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className={`text-[16px] font-bold ${onDark ? "text-white drop-shadow" : "text-foreground"}`}>
          {t("search.mapPrompt")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/shule?view=ramani")}
          style={{ backgroundImage: MAP_PATTERN }}
          className="group mx-auto mt-4 flex h-16 w-[316px] max-w-full items-center rounded-full border border-primary/60 bg-card pl-1.5 pr-6 shadow-sm transition hover:border-primary hover:shadow-md"
        >
          <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Map className="h-6 w-6" />
          </span>
          <span className="flex-1 text-center text-[16px] text-foreground">{t("search.mapButton")}</span>
        </button>
      </div>
    </>
  );
}
