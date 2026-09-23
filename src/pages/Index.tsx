import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, MapPin, MessageCircle, Quote, Shield, Star, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { SchoolCard } from "@/components/SchoolCard";
import { CollegeCard } from "@/components/CollegeCard";
import { LeadCaptureStrip } from "@/components/LeadCaptureStrip";
import { HeroSearch } from "@/components/home/HeroSearch";
import { RankingBanner } from "@/components/home/RankingBanner";
import { RankingRail } from "@/components/home/RankingRail";
import { SectionHeading } from "@/components/home/SectionHeading";
import { SpotlightCard } from "@/components/home/SpotlightCard";
import { useColleges, useRankings, useRegions, useSchools } from "@/hooks/useSchools";
import { schools as seedSchools } from "@/data/schools";
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

const rotatingWords = ["Sekondari", "A-Level", "Vyuo"];

const stats = [
  { icon: GraduationCap, label: "Shule na vyuo", value: "150+" },
  { icon: Users, label: "Wanafunzi waliosaidiwa", value: "7,000+" },
  { icon: Shield, label: "Shule zimethibitishwa", value: "100%" },
  { icon: Star, label: "Wastani wa wazazi", value: "4.7/5" },
];

const Index = () => {
  const [word, setWord] = useState(0);

  const { data: regions = [] } = useRegions();
  const { data: rails = [] } = useRankings();
  const { data: featured } = useSchools({ limit: 6, sort: "rating" });
  const { data: colleges = [] } = useColleges();

  useEffect(() => {
    const timer = setInterval(() => setWord((value) => (value + 1) % rotatingWords.length), 2600);
    return () => clearInterval(timer);
  }, []);

  const featuredSchools = featured?.items?.length ? featured.items : seedSchools;
  const spotlight = rails[0]?.schools?.[0] ?? featuredSchools[0];
  const [primaryRail, ...otherRails] = rails;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Classmate — Pata Shule Bora za Sekondari na Vyuo Tanzania"
        description="Tafuta, linganisha na omba nafasi katika shule bora za sekondari na vyuo binafsi Tanzania. O-Level, A-Level na vyuo — ushauri bure ndani ya dakika 5."
        path="/"
      />
      <Navbar />

      {/* Hero — headline, one line of promise, then the search bar. */}
      <section className="relative overflow-hidden px-4 pb-6 pt-14 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-[1000px] text-center">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-ai-chat"))}
            className="mx-auto mb-7 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[13px] font-medium text-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <MessageCircle className="h-3.5 w-3.5 text-primary" />
            Uliza mshauri wetu — ni bure
          </button>

          <h1 className="display-xl text-foreground">
            Tafuta, linganisha na uunganishwe
            <br className="hidden sm:block" /> na{" "}
            <span className="text-primary">shule bora za {rotatingWords[word]}</span>
            <br className="hidden sm:block" /> Tanzania
          </h1>

          <p className="mx-auto mt-6 max-w-[640px] text-[1.0625rem] leading-relaxed text-muted-foreground">
            Classmate inawapa wazazi taarifa za bure, kamili na zinazosasishwa — ada halisi,
            matokeo ya mitihani na mazingira ya shule — ili kumpata mtoto shule sahihi.
          </p>

          <div className="mt-10">
            <HeroSearch regions={regions} />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/70 bg-card py-5">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 sm:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2.5">
              <stat.icon className="h-[18px] w-[18px] text-primary" />
              <span className="font-display text-[0.9375rem] font-bold text-foreground">{stat.value}</span>
              <span className="text-[13px] text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <RankingBanner year={new Date().getFullYear() + 1} schoolCount={Math.max(featured?.total ?? 0, seedSchools.length)} />

      {/* Ranking rails — the first carries the section eyebrow. */}
      {primaryRail && (
        <RankingRail
          eyebrow="Kwa aina ya shule"
          title={primaryRail.title}
          subtitle={primaryRail.subtitle}
          schools={primaryRail.schools}
          action={{ label: "Angalia zote", to: "/shule?sort=results" }}
        />
      )}

      {spotlight && <SpotlightCard school={spotlight} />}

      {otherRails.slice(0, 2).map((rail) => (
        <RankingRail
          key={rail.id}
          title={rail.title}
          subtitle={rail.subtitle}
          schools={rail.schools}
          action={{ label: "Angalia zote", to: "/shule" }}
        />
      ))}

      <LeadCaptureStrip />

      {/* Featured grid */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading
            eyebrow="Zinazoangaliwa zaidi"
            title="Shule maarufu kwa wazazi"
            subtitle="Zilizotembelewa na kuombwa zaidi wiki hii."
            action={{ label: "Shule zote", to: "/shule" }}
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSchools.slice(0, 6).map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        </div>
      </section>

      {otherRails.slice(2).map((rail) => (
        <RankingRail
          key={rail.id}
          title={rail.title}
          subtitle={rail.subtitle}
          schools={rail.schools}
          action={{ label: "Angalia zote", to: "/shule" }}
        />
      ))}

      {/* Colleges */}
      {colleges.length > 0 && (
        <section className="bg-card py-12 sm:py-16">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
            <SectionHeading
              eyebrow="Baada ya sekondari"
              title="Vyuo na taasisi za ufundi"
              subtitle="Stashahada, shahada na mafunzo ya vitendo kote nchini."
              action={{ label: "Vyuo vyote", to: "/shule?tab=vyuo" }}
            />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {colleges.slice(0, 4).map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Parents */}
      <section className="overflow-hidden py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading eyebrow="Maoni ya wazazi" title="Waliokwisha pata shule" />
        </div>
        <div className="relative mt-8 w-full">
          <div className="flex w-max animate-marquee gap-5">
            {[0, 1].flatMap((set) =>
              testimonials.map((entry) => (
                <figure
                  key={entry.name + set}
                  className="flex w-[320px] shrink-0 flex-col justify-between rounded-[20px] bg-card p-5 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.25)]"
                >
                  <Quote className="h-5 w-5 text-primary/35" />
                  <blockquote className="mt-3 text-[0.9375rem] leading-relaxed text-foreground/85">
                    {entry.text}
                  </blockquote>
                  <figcaption className="mt-4 flex items-center gap-3">
                    <img src={entry.image} alt="" className="h-9 w-9 rounded-full object-cover" />
                    <span className="leading-tight">
                      <span className="block text-[13px] font-semibold text-foreground">{entry.name}</span>
                      <span className="block text-[12px] text-muted-foreground">{entry.role}</span>
                    </span>
                  </figcaption>
                </figure>
              )),
            )}
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="pb-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <div className="rounded-[24px] bg-secondary px-6 py-12 text-center sm:px-10 sm:py-16">
            <p className="text-[13px] font-medium text-background/60">Vinjari kwa mkoa</p>
            <h2 className="display-md mt-3 text-background">Shule zilizo karibu nawe</h2>

            <div className="mx-auto mt-8 flex max-w-[860px] flex-wrap justify-center gap-2.5">
              {regions.map((region) => (
                <Link
                  key={region.name}
                  to={`/shule?region=${encodeURIComponent(region.name)}`}
                  className="group flex items-center gap-2 rounded-full bg-background/10 px-4 py-2.5 text-[0.9375rem] font-medium text-background transition hover:bg-background hover:text-foreground"
                >
                  <MapPin className="h-3.5 w-3.5 opacity-60" />
                  {region.name}
                  {region.schoolCount > 0 && (
                    <span className="text-[12px] opacity-60">{region.schoolCount}</span>
                  )}
                </Link>
              ))}
            </div>

            <Link
              to="/omba-nafasi"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Omba tukusaidie kuchagua
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
