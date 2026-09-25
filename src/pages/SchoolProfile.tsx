import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Camera,
  CheckCircle,
  ChevronRight,
  Globe,
  Heart,
  Home,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  PenLine,
  Phone,
  Plus,
  Share2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthDialog } from "@/components/AuthDialog";
import { PaywallDialog } from "@/components/PaywallDialog";
import { SEO } from "@/components/SEO";
import { FlagTZ, MoneyBag, Starburst } from "@/components/icons";
import { schools as seedSchools, formatTZS } from "@/data/schools";
import { useSchool } from "@/hooks/useSchools";
import { feeRange, gradeFor, isRecommended } from "@/lib/grading";
import { toggleCompare, useCompareIds } from "@/lib/compare";
import { useSession } from "@/lib/session";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/translations";

const SAVED_KEY = "classmate.saved";

const readSaved = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    return [];
  }
};

const tabs: { id: string; key: TranslationKey }[] = [
  { id: "muhtasari", key: "profile.tab.overview" },
  { id: "matokeo", key: "profile.tab.results" },
  { id: "ada", key: "profile.tab.fees" },
  { id: "vifaa", key: "profile.tab.facilities" },
  { id: "programu", key: "profile.tab.programs" },
  { id: "mawasiliano", key: "profile.tab.contact" },
];

const photoKeys: TranslationKey[] = [
  "profile.photo.campus",
  "profile.photo.classrooms",
  "profile.photo.labs",
  "profile.photo.dorms",
  "profile.photo.sports",
  "profile.photo.library",
];

const breadcrumbKey = {
  Boarding: "profile.breadcrumbBoarding",
  Day: "profile.breadcrumbDay",
  Both: "profile.breadcrumbBoth",
} as const;

const kindQuery = { Boarding: "/shule?boarding=Boarding", Day: "/shule?boarding=Day", Both: "/shule" } as const;

const SchoolProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = useT();
  // Live record when the API answers; the bundled catalogue covers it while offline.
  const { data: fetched } = useSchool(id);
  const school = fetched ?? seedSchools.find((s) => s.id === id);

  const session = useSession();
  const compareIds = useCompareIds();

  const [contactRevealed, setContactRevealed] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setContactRevealed(false);
    setActiveTab(tabs[0].id);
    setSaved(id ? readSaved().includes(id) : false);
  }, [id]);

  // Show upsell after 1 minute (60s) on page
  useEffect(() => {
    if (!school) return;
    const t = setTimeout(() => setShowUpsell(true), 60000);
    return () => clearTimeout(t);
  }, [school]);

  if (!school) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="wrap py-20 text-center">
          <h1 className="text-2xl font-bold">{t("profile.notFound")}</h1>
          <Link to="/shule" className="mt-4 inline-block text-primary hover:underline">
            {t("profile.backToList")}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const perf = school.performance;
  const grade = gradeFor(school);
  const comparing = compareIds.includes(school.id);

  /** Public site derived from the school's mail domain until the API carries a website field. */
  const website = school.email.includes("@") ? `https://${school.email.split("@")[1]}` : null;

  const whatsappNumber = school.phone.replace(/[^0-9]/g, "").replace(/^0/, "255");
  const whatsappMsg = encodeURIComponent(
    `Habari! Ninapata taarifa zenu kupitia Classmate. Nataka kujua zaidi kuhusu ${school.name}. Asante!`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;

  const handleRevealContact = () => {
    setContactRevealed(true);
    // Track click for analytics
    console.log("[Classmate Track] contact_revealed", { school: school.id, timestamp: Date.now() });
  };

  const handleCompare = () => {
    const result = toggleCompare(school.id);
    if (result.full) toast.error(t("profile.compareFull"));
    else toast.success(result.added ? t("profile.compareAdded", { name: school.name }) : t("profile.compareRemoved"));
  };

  const handleSave = () => {
    const current = readSaved();
    const next = current.includes(school.id) ? current.filter((entry) => entry !== school.id) : [...current, school.id];
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* private mode */
    }
    setSaved(next.includes(school.id));
    toast.success(next.includes(school.id) ? t("profile.savedToast") : t("profile.unsavedToast"));
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: school.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(t("profile.linkCopied"));
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const jumpTo = (tabId: string) => {
    setActiveTab(tabId);
    document.getElementById(tabId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const typeLabel =
    school.boardingDay === "Both"
      ? `${t("profile.fees.boarding")} / ${t("profile.fees.day")}`
      : school.boardingDay === "Boarding"
        ? t("profile.fees.boarding")
        : t("profile.fees.day");

  const genderLabel =
    school.gender === "Boys" ? t("listing.boys") : school.gender === "Girls" ? t("listing.girls") : t("listing.mixed");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${school.name} — ${school.location} | Classmate`}
        description={`${school.name} ni shule ya ${school.levels?.join(", ") || "sekondari"} iliyopo ${school.location}. Tazama ufaulu, ada, boarding, picha na omba nafasi kupitia Classmate.`}
        path={`/shule/${school.id}`}
        type="product"
        image={school.image}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: school.name,
          description: `Shule ya ${school.levels?.join(", ") || "sekondari"} iliyopo ${school.location}, Tanzania.`,
          url: `https://classmate.co.tz/shule/${school.id}`,
          address: { "@type": "PostalAddress", addressLocality: school.location, addressCountry: "TZ" },
          telephone: school.phone,
          image: school.image,
        }}
      />
      <Navbar variant="overlay" />

      {/* Full-bleed hero */}
      <section className="relative h-[560px] sm:h-[600px]">
        <img src={school.image} alt={school.name} className="h-full w-full object-cover" />
        <div className="photo-scrim absolute inset-0" />

        <div className="absolute inset-x-0 bottom-0">
          <div className="wrap flex flex-col gap-6 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-4 text-[2.25rem] font-bold leading-[1.1] text-white sm:text-[3.375rem]">
                {school.name}
                <FlagTZ className="h-[30px] w-[44px]" />
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-3 text-[15px] text-white">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[15px] font-bold">{grade}</span>
                <span className="text-white/70">•</span>
                <button
                  type="button"
                  onClick={() => (session ? toast.info(t("profile.reviewsSoon")) : setAuthOpen(true))}
                  className="flex items-center gap-2 rounded-lg bg-black/55 px-4 py-2 font-semibold backdrop-blur-sm transition hover:bg-black/70"
                >
                  {session ? <PenLine className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  {session ? t("profile.writeReview") : t("profile.loginToReview")}
                </button>
                {isRecommended(school) && (
                  <>
                    <span className="text-white/70">•</span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Starburst className="h-4 w-4 text-teal" />
                      {t("card.recommended")}
                    </span>
                  </>
                )}
                <span className="text-white/70">•</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <MapPin className="h-4 w-4" fill="currentColor" />
                  {school.location}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 md:items-end">
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[15px] text-teal hover:underline">
                  <Globe className="h-4 w-4" />
                  {t("profile.website")}
                </a>
              )}
              <div className="flex items-center gap-6 text-[15px] font-semibold text-white">
                <button type="button" onClick={handleCompare} className="flex items-center gap-1 transition hover:text-teal">
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  {comparing ? t("profile.comparing") : t("profile.compare")}
                </button>
                <button type="button" onClick={handleSave} className="flex items-center gap-1 transition hover:text-teal">
                  <Heart className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                  {saved ? t("profile.saved") : t("profile.save")}
                </button>
                <button type="button" onClick={handleShare} className="flex items-center gap-1 transition hover:text-teal">
                  <Share2 className="h-4 w-4" />
                  {t("profile.share")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="wrap flex flex-wrap items-center gap-1.5 py-4 text-[13px] text-foreground">
        <Link to="/" className="hover:text-primary">{t("nav.home")}</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <Link to={kindQuery[school.boardingDay]} className="hover:text-primary">{t(breadcrumbKey[school.boardingDay])}</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{school.name}</span>
      </nav>

      {/* Section tabs */}
      <div className="wrap">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dcdcdc]">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => jumpTo(tab.id)}
                className={`whitespace-nowrap border-b-[3px] pb-3 pt-2 text-[16px] transition ${
                  activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-foreground hover:text-primary"
                }`}
              >
                {t(tab.key)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 pb-3">
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[15px] text-teal hover:underline">
                <Globe className="h-4 w-4" />
                {website.replace("https://", "www.")}
              </a>
            )}
            <span className="flex items-center gap-2 text-[#9a9a9a]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-1.6 19.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 12 2Z" />
              </svg>
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill="currentColor">
                <path d="M22.5 7.2a2.8 2.8 0 0 0-2-2C18.8 4.8 12 4.8 12 4.8s-6.8 0-8.5.4a2.8 2.8 0 0 0-2 2C1 8.9 1 12 1 12s0 3.1.5 4.8a2.8 2.8 0 0 0 2 2c1.7.4 8.5.4 8.5.4s6.8 0 8.5-.4a2.8 2.8 0 0 0 2-2c.5-1.7.5-4.8.5-4.8s0-3.1-.5-4.8ZM9.8 15.1V8.9l5.7 3.1-5.7 3.1Z" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-8">
        <div className="wrap grid gap-6 lg:grid-cols-[minmax(0,1fr)_425px]">
          <div className="space-y-6">
            {/* Overview */}
            <div id="muhtasari" className="scroll-mt-24 rounded-2xl bg-cream p-6 sm:p-8">
              <h2 className="text-[28px] font-bold text-foreground sm:text-[34px]">
                {t("profile.about")}{" "}
                <span className="text-[15px] font-normal text-foreground">({school.levels.join(" · ")})</span>
              </h2>
              <p className="mt-4 text-[16px] leading-[1.7] text-foreground">{school.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { label: t("profile.stat.grade"), value: grade },
                  { label: t("profile.stat.rating"), value: school.rating > 0 ? school.rating.toFixed(1) : "—" },
                  { label: t("profile.stat.divisionOne"), value: `${perf.divisionI}%` },
                  { label: t("profile.stat.type"), value: typeLabel },
                  { label: t("profile.stat.gender"), value: genderLabel },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-[#e8e2cf] bg-card px-3 py-3 text-center">
                    <p className="text-[18px] font-bold text-foreground">{stat.value}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic performance */}
            <div id="matokeo" className="tile scroll-mt-24 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-[22px] font-bold text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" /> {t("profile.results")}
              </h2>
              <div className="mt-5 space-y-4">
                {[
                  { label: "Division I", value: perf.divisionI, color: "bg-success" },
                  { label: "Division II", value: perf.divisionII, color: "bg-primary" },
                  { label: "Division III", value: perf.divisionIII, color: "bg-gold" },
                  { label: "Division IV", value: perf.divisionIV, color: "bg-muted-foreground" },
                  { label: "Division 0", value: perf.division0, color: "bg-destructive" },
                ].map((div) => (
                  <div key={div.label}>
                    <div className="flex items-center justify-between text-[15px]">
                      <span className="text-foreground">{div.label}</span>
                      <span className="font-bold text-foreground">{div.value}%</span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full rounded-full bg-muted">
                      <div className={`h-2.5 rounded-full ${div.color} transition-all duration-500`} style={{ width: `${div.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div id="vifaa" className="tile scroll-mt-24 p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-[22px] font-bold text-foreground">
                <Home className="h-5 w-5 text-primary" /> {t("profile.facilities")}
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {school.facilities.map((f) => (
                  <div key={f} className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5 text-[15px] text-foreground">
                    <CheckCircle className="h-4 w-4 text-success" /> {f}
                  </div>
                ))}
                {school.facilities.length === 0 && <p className="text-[15px] text-muted-foreground">{t("profile.facilitiesEmpty")}</p>}
              </div>
            </div>

            {/* Programs */}
            <div id="programu" className="tile scroll-mt-24 p-6 sm:p-8">
              <h2 className="text-[22px] font-bold text-foreground">{t("profile.programs")}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {school.programs.map((p) => (
                  <span key={p} className="flex items-center gap-1.5 rounded-md border border-[#cfcfcf] px-3 py-1.5 text-[15px] text-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-primary" /> {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Photos placeholder */}
            <div className="tile p-6 sm:p-8">
              <h2 className="flex items-center gap-2 text-[22px] font-bold text-foreground">
                <Camera className="h-5 w-5 text-primary" /> {t("profile.photos")}
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {photoKeys.map((key) => (
                  <div key={key} className="flex aspect-video items-center justify-center rounded-lg bg-muted text-[14px] text-muted-foreground">
                    <div className="text-center">
                      <Camera className="mx-auto mb-1 h-6 w-6" />
                      {t(key)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            {/* Contact */}
            <div id="mawasiliano" className="tile scroll-mt-24 p-6 sm:p-8">
              <h3 className="text-[19px] font-bold text-foreground">{t("profile.contactTitle", { name: school.name })}</h3>

              <div className="mt-5 flex items-center gap-4">
                <img src={school.image} alt="" className="h-12 w-12 rounded-full object-cover" />
                <span className="text-[16px] text-foreground">{t("profile.admissionsOfficer")}</span>
              </div>

              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-5 block">
                <Button className="h-[52px] w-full gap-2 rounded-lg text-[16px] font-semibold" size="lg">
                  <MessageSquare className="h-4 w-4" /> {t("profile.sendMessage")}
                </Button>
              </a>
              <Link to="/omba-nafasi" className="mt-3 block">
                <Button variant="outline" className="h-[52px] w-full rounded-lg text-[16px] font-semibold" size="lg">
                  {t("profile.apply")}
                </Button>
              </Link>

              <div className="mt-6 border-t border-[#ededed] pt-5">
                {contactRevealed ? (
                  <div className="space-y-3 text-[15px] text-foreground">
                    <a href={`tel:${school.phone}`} className="flex items-center gap-2 transition-colors hover:text-primary">
                      <Phone className="h-4 w-4 text-primary" /> {school.phone}
                    </a>
                    <a href={`mailto:${school.email}`} className="flex items-center gap-2 transition-colors hover:text-primary">
                      <Mail className="h-4 w-4 text-primary" /> {school.email}
                    </a>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> {school.location}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[15px] text-foreground">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="select-none blur-sm">+255 7XX XXX XXX</span>
                    </div>
                    <div className="flex items-center gap-2 text-[15px] text-foreground">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="select-none blur-sm">info@school.ac.tz</span>
                    </div>
                    <p className="flex items-center gap-2 text-[15px] text-foreground">
                      <MapPin className="h-4 w-4 text-primary" /> {school.location}
                    </p>
                    <Button onClick={handleRevealContact} variant="outline" className="mt-2 w-full gap-2 rounded-lg" size="sm">
                      <Lock className="h-3.5 w-3.5" /> {t("profile.revealContact")}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Fees */}
            <div id="ada" className="tile scroll-mt-24 p-6 sm:p-8">
              <h3 className="flex items-center gap-2 text-[19px] font-bold text-foreground">
                <MoneyBag className="h-5 w-5" /> {t("profile.feesTitle")}
              </h3>
              <p className="mt-1 text-[15px] text-foreground">
                {t("profile.feesPerYear", { range: feeRange(school.tuitionMin, school.tuitionMax) })}
              </p>
              <div className="mt-4 space-y-2">
                {school.feesStructure.boarding && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5">
                    <span className="text-[15px] text-foreground">{t("profile.fees.boarding")}</span>
                    <span className="font-semibold text-foreground">{formatTZS(school.feesStructure.boarding)}</span>
                  </div>
                )}
                {school.feesStructure.day && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5">
                    <span className="text-[15px] text-foreground">{t("profile.fees.day")}</span>
                    <span className="font-semibold text-foreground">{formatTZS(school.feesStructure.day)}</span>
                  </div>
                )}
                {school.feesStructure.otherContributions > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5">
                    <span className="text-[15px] text-foreground">{t("profile.fees.other")}</span>
                    <span className="font-semibold text-foreground">{formatTZS(school.feesStructure.otherContributions)}</span>
                  </div>
                )}
                <p className="pt-2 text-[12px] text-muted-foreground">{t("profile.feesNote", { year: new Date().getFullYear() })}</p>
              </div>
            </div>

            {/* Upsell CTA - always visible */}
            <div
              className="cursor-pointer rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 transition-all hover:shadow-md"
              onClick={() => navigate("/omba-nafasi")}
            >
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-[14px] font-bold uppercase text-foreground">{t("profile.upsellTitle")}</h3>
              </div>
              <p className="text-[13px] leading-relaxed text-foreground">{t("profile.upsellBody")}</p>
              <Button size="sm" className="mt-3 w-full gap-1 rounded-lg text-[13px]">
                {t("profile.upsellCta")}
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {/* Timed Upsell Dialog - compact */}
      <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
        <DialogContent className="max-w-xs rounded-2xl p-4">
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="flex flex-col items-center gap-1 text-sm font-bold uppercase">
              <Sparkles className="h-5 w-5 text-primary" />
              {t("profile.upsellDialogTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">{t("profile.upsellDialogBody")}</DialogDescription>
          </DialogHeader>
          <Button
            className="w-full bg-cta text-sm font-bold text-cta-foreground hover:bg-cta/90"
            size="sm"
            onClick={() => {
              setShowUpsell(false);
              navigate("/omba-nafasi");
            }}
          >
            {t("profile.upsellCta")}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Paywall from sidebar CTA */}
      <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />

      <Footer />
    </div>
  );
};

export default SchoolProfile;
