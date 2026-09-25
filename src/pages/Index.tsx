import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, MapPin, Quote, Shield, Star, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { CollegeCard } from "@/components/CollegeCard";
import { LeadCaptureStrip } from "@/components/LeadCaptureStrip";
import { HeroSearch } from "@/components/home/HeroSearch";
import { HeroSlider } from "@/components/home/HeroSlider";
import { RankingBanner } from "@/components/home/RankingBanner";
import { SchoolGrid } from "@/components/home/SchoolGrid";
import { SectionHeading } from "@/components/home/SectionHeading";
import { SpotlightCard } from "@/components/home/SpotlightCard";
import { Faq } from "@/components/home/Faq";
import { useColleges, useRankings, useRegions, useSchools } from "@/hooks/useSchools";
import { schools as seedSchools } from "@/data/schools";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/translations";
import parentMariam from "@/assets/parent-mariam.jpg";
import parentJohn from "@/assets/parent-john.jpg";
import parentFatma from "@/assets/parent-fatma.jpg";

const testimonials = [
  {
    name: "Mariam J.",
    role: "Mzazi, Dar es Salaam",
    text: "Classmate ilinisaidia kupata shule bora kwa mtoto wangu ndani ya siku 3 tu. Walinipiga simu na kunielekeza vizuri!",
    image: parentMariam,
  },
  {
    name: "John M.",
    role: "Mzazi, Arusha",
    text: "Nilikuwa natafuta shule ya boarding kwa bei nafuu — Classmate waliniunganisha na chaguo 4 bora. Asante sana!",
    image: parentJohn,
  },
  {
    name: "Fatma A.",
    role: "Mzazi, Mwanza",
    text: "Fomu ilikuwa rahisi kujaza, na msaada wao ulikuwa wa haraka. Mtoto wangu sasa anasoma shule nzuri.",
    image: parentFatma,
  },
];

const rotatingWords: TranslationKey[] = ["hero.word.secondary", "hero.word.alevel", "hero.word.boarding", "hero.word.day"];

const stats: { icon: typeof GraduationCap; key: TranslationKey; value: string }[] = [
  { icon: GraduationCap, key: "home.stats.schools", value: "150+" },
  { icon: Users, key: "home.stats.students", value: "7,000+" },
  { icon: Shield, key: "home.stats.verified", value: "100%" },
  { icon: Star, key: "home.stats.rating", value: "4.7/5" },
];

/** Section titles for the ranking rails the API (or the bundled fallback) returns. */
const railTitleKeys: Record<string, TranslationKey> = {
  "top-overall": "rail.top-overall",
  "top-girls": "rail.top-girls",
  "top-boys": "rail.top-boys",
  "top-boarding": "rail.top-boarding",
  "top-day": "rail.top-day",
  "top-value": "rail.top-value",
};

const Index = () => {
  const [word, setWord] = useState(0);
  const t = useT();

  const { data: regions = [] } = useRegions();
  const { data: rails = [] } = useRankings();
  const { data: featured } = useSchools({ limit: 6, sort: "rating" });
  const { data: colleges = [] } = useColleges();

  useEffect(() => {
    const timer = setInterval(() => setWord((value) => (value + 1) % rotatingWords.length), 2600);
    return () => clearInterval(timer);
  }, []);

  const featuredSchools = featured?.items?.length ? featured.items : seedSchools;
  const spotlight = rails.find((rail) => rail.id === "top-overall")?.schools?.[0] ?? featuredSchools[0];
  const typeRails = ["top-girls", "top-boys", "top-boarding", "top-day", "top-value"]
    .map((id) => rails.find((rail) => rail.id === id))
    .filter((rail): rail is NonNullable<typeof rail> => Boolean(rail));

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Classmate — Pata Shule Bora za Sekondari na Vyuo Tanzania"
        description="Tafuta, linganisha na omba nafasi katika shule bora za sekondari na vyuo binafsi Tanzania. O-Level, A-Level na vyuo — ushauri bure ndani ya dakika 5."
        path="/"
      />
      <Navbar />

      {/* Hero — real campus photos behind the headline, then the search bar. */}
      <section className="relative pb-20 pt-[60px] sm:pt-[86px]">
        <HeroSlider />

        <div className="wrap relative text-center">
          <h1 className="display-xl mx-auto max-w-[980px] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            {t("hero.titleA")}
            <br className="hidden sm:block" />{" "}
            <span className="text-primary">{t("hero.titleHighlight", { word: t(rotatingWords[word]) })}</span>{" "}
            {t("hero.titleB")}
            <br className="hidden sm:block" /> {t("hero.titleC")}
          </h1>

          <p className="mx-auto mt-6 max-w-[700px] text-[16px] leading-[1.6] text-white/90 drop-shadow">
            {t("hero.subtitleA")}
            <br className="hidden md:block" /> {t("hero.subtitleB")}
          </p>

          <div className="mt-14">
            <HeroSearch regions={regions} onDark />
          </div>
        </div>
      </section>

      {spotlight && <SpotlightCard school={spotlight} />}

      <RankingBanner year={new Date().getFullYear() + 1} />

      {typeRails.map((rail, index) => (
        <SchoolGrid
          key={rail.id}
          eyebrow={index === 0 ? t("rail.byType") : undefined}
          title={railTitleKeys[rail.id] ? t(railTitleKeys[rail.id]) : rail.title}
          schools={rail.schools}
        />
      ))}

      {/* Trust strip */}
      <section className="py-10">
        <div className="wrap flex flex-wrap items-center justify-center gap-x-12 gap-y-4 border-y border-dashed border-[#9a9a9a] py-7">
          {stats.map((stat) => (
            <div key={stat.key} className="flex items-center gap-2.5">
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="text-[16px] font-bold text-foreground">{stat.value}</span>
              <span className="text-[15px] text-foreground">{t(stat.key)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Colleges */}
      {colleges.length > 0 && (
        <section className="py-12">
          <div className="wrap">
            <SectionHeading
              eyebrow={t("home.colleges.eyebrow")}
              title={t("home.colleges.title")}
              action={{ label: t("home.colleges.action"), to: "/shule?tab=colleges" }}
            />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {colleges.slice(0, 3).map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Parents */}
      <section className="py-12">
        <div className="wrap">
          <SectionHeading eyebrow={t("home.parents.eyebrow")} title={t("home.parents.title")} />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((entry) => (
              <figure key={entry.name} className="tile flex flex-col justify-between p-7">
                <Quote className="h-6 w-6 text-primary/40" />
                <blockquote className="mt-4 text-[16px] leading-[1.7] text-foreground">{entry.text}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-[#ededed] pt-5">
                  <img src={entry.image} alt="" className="h-11 w-11 rounded-full object-cover" />
                  <span className="leading-tight">
                    <span className="block text-[15px] font-semibold text-foreground">{entry.name}</span>
                    <span className="block text-[13px] text-muted-foreground">{entry.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <LeadCaptureStrip />

      {/* Regions */}
      <section className="py-12">
        <div className="wrap">
          <SectionHeading eyebrow={t("home.regions.eyebrow")} title={t("home.regions.title")} />
          <div className="mt-8 flex flex-wrap gap-3">
            {regions.map((region) => (
              <Link
                key={region.name}
                to={`/shule?region=${encodeURIComponent(region.name)}`}
                className="flex items-center gap-2 rounded-md border border-[#cfcfcf] bg-card px-4 py-2.5 text-[15px] text-foreground transition hover:border-primary hover:text-primary"
              >
                <MapPin className="h-4 w-4" />
                {region.name}
                {region.schoolCount > 0 && <span className="text-muted-foreground">({region.schoolCount})</span>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div id="maswali">
        <Faq />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
