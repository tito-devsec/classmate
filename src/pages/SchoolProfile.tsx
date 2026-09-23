import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Phone, Mail, Star, BookOpen, CheckCircle, ArrowLeft, TrendingUp, Home, DollarSign, Camera, MessageSquare, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { schools as seedSchools, formatTZS } from "@/data/schools";
import { PaywallDialog } from "@/components/PaywallDialog";
import { SEO } from "@/components/SEO";
import { useSchool } from "@/hooks/useSchools";
import { feeRange, gradeFor } from "@/lib/grading";

const SchoolProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Live record when the API answers; the bundled catalogue covers it while offline.
  const { data: fetched } = useSchool(id);
  const school = fetched ?? seedSchools.find((s) => s.id === id);
  const [contactRevealed, setContactRevealed] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  

  

  useEffect(() => {
    window.scrollTo(0, 0);
    setContactRevealed(false);
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
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">School not found</h1>
          <Link to="/shule" className="mt-4 inline-block text-primary hover:underline">
            Back to listing
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const perf = school.performance;

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

  return (
    <div className="min-h-screen">
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
      <Navbar />

      {/* Hero with school image */}
      <section className="px-4 pt-6 sm:px-6">
        <div className="mx-auto max-w-[1320px]">
          <div className="relative overflow-hidden rounded-[24px]">
            <div className="relative aspect-[16/10] sm:aspect-[21/9]">
              {school.image ? (
                <img src={school.image} alt={school.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-muted">
                  <BookOpen className="h-24 w-24 text-primary/20" />
                </div>
              )}
              <div className="photo-scrim absolute inset-0" />

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:p-8 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {school.levels.map((level) => (
                      <span
                        key={level}
                        className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm"
                      >
                        {level}
                      </span>
                    ))}
                  </div>

                  <h1 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight tracking-tight text-white sm:text-[2.5rem]">
                    {school.name}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {gradeFor(school)}
                    </span>
                    {school.rating > 0 && (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                        <Star className="h-4 w-4 fill-white text-white" />
                        {school.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/90">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {feeRange(school.tuitionMin, school.tuitionMax)}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {school.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <Link to="/shule" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Rudi kwenye Orodha
          </Link>

          {/* Quick Stats Bar */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5 rounded-lg border bg-card p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Star className="h-4 w-4 fill-primary" />
                <span className="font-display text-xl font-bold">{school.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl font-bold text-success">{perf.divisionI}%</p>
              <p className="text-xs text-muted-foreground">Division I</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{school.boardingDay}</p>
              <p className="text-xs text-muted-foreground">Aina</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{school.gender}</p>
              <p className="text-xs text-muted-foreground">Jinsia</p>
            </div>
            <div className="text-center col-span-2 md:col-span-1">
              <p className="font-display text-lg font-bold text-foreground">{school.levels.join(" / ")}</p>
              <p className="text-xs text-muted-foreground">Level</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Overview */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Kuhusu Shule</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{school.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {school.levels.map((l) => (
                    <span key={l} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{l}</span>
                  ))}
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{school.boardingDay}</span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{school.gender}</span>
                </div>
              </div>

              {/* 2. Academic Performance */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" /> Matokeo ya Mitihani
                </h2>
                <div className="mt-4 space-y-4">
                  {[
                    { label: "Division I", value: perf.divisionI, color: "bg-success" },
                    { label: "Division II", value: perf.divisionII, color: "bg-primary" },
                    { label: "Division III", value: perf.divisionIII, color: "bg-accent" },
                    { label: "Division IV", value: perf.divisionIV, color: "bg-muted-foreground" },
                    { label: "Division 0", value: perf.division0, color: "bg-destructive" },
                  ].map((div) => (
                    <div key={div.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{div.label}</span>
                        <span className="font-bold text-foreground">{div.value}%</span>
                      </div>
                      <div className="mt-1 h-2.5 w-full rounded-full bg-muted">
                        <div
                          className={`h-2.5 rounded-full ${div.color} transition-all duration-500`}
                          style={{ width: `${div.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Facilities */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <Home className="h-5 w-5 text-primary" /> Vifaa na Mazingira
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {school.facilities.map((f) => (
                    <div key={f} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-success" /> {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Programs */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Programu za Masomo</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {school.programs.map((p) => (
                    <span key={p} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                      <CheckCircle className="h-3.5 w-3.5" /> {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* 5. Photos placeholder */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <Camera className="h-5 w-5 text-primary" /> Picha za Shule
                </h2>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Campus", "Madarasa", "Maabara", "Bweni", "Michezo", "Maktaba"].map((label) => (
                    <div key={label} className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                      <div className="text-center">
                        <Camera className="mx-auto h-6 w-6 mb-1" />
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="sticky top-20 space-y-4">
                {/* Fees Structure */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <DollarSign className="h-5 w-5 text-primary" /> Ada za Shule
                  </h3>
                  <div className="mt-4 space-y-3">
                    {school.feesStructure.boarding && (
                      <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                        <span className="text-sm text-muted-foreground">Boarding</span>
                        <span className="font-semibold text-foreground">{formatTZS(school.feesStructure.boarding)}</span>
                      </div>
                    )}
                    {school.feesStructure.day && (
                      <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                        <span className="text-sm text-muted-foreground">Day</span>
                        <span className="font-semibold text-foreground">{formatTZS(school.feesStructure.day)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground">Ada kwa mwaka (2026)</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Link to="/omba-nafasi" className="block">
                      <Button
                        className="w-full bg-cta hover:bg-cta/90 text-cta-foreground"
                        size="lg"
                      >
                        Omba Nafasi
                      </Button>
                    </Link>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button variant="outline" className="w-full gap-2 border-green-500/30 text-green-600 hover:bg-green-50 hover:text-green-700" size="lg">
                        <MessageSquare className="h-4 w-4" /> WhatsApp Shule
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Contact — Soft Gate */}
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">Mawasiliano</h3>
                  {contactRevealed ? (
                    <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                      <a href={`tel:${school.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Phone className="h-4 w-4 text-primary" /> {school.phone}
                      </a>
                      <a href={`mailto:${school.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Mail className="h-4 w-4 text-primary" /> {school.email}
                      </a>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {school.location}</p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="select-none blur-sm">+255 7XX XXX XXX</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="select-none blur-sm">info@school.ac.tz</span>
                      </div>
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" /> {school.location}
                      </p>
                      <Button
                        onClick={handleRevealContact}
                        variant="outline"
                        className="mt-2 w-full gap-2"
                        size="sm"
                      >
                        <Lock className="h-3.5 w-3.5" /> Bonyeza kuona mawasiliano
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upsell CTA - always visible */}
                <div
                  className="rounded-lg border-2 border-primary/30 bg-primary/5 p-5 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => navigate("/omba-nafasi")}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground uppercase">
                      Je, hii ndio shule inayolingana na vigezo vyako?
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tunakuchagulia shule bora kulingana na bajeti, eneo na mahitaji ya mtoto wako.
                  </p>
                  <Button size="sm" className="w-full gap-1 text-xs mt-3">
                    🚀 Pata Sasa Hivi
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timed Upsell Dialog - compact */}
      <Dialog open={showUpsell} onOpenChange={setShowUpsell}>
        <DialogContent className="max-w-xs p-4 rounded-2xl">
          <DialogHeader className="text-center space-y-1">
            <DialogTitle className="flex flex-col items-center gap-1 text-sm font-bold uppercase">
              <Sparkles className="h-5 w-5 text-primary" />
              Je, Unatafuta Shule Bora?
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Tunaweza kukuchagulia shule 3 bora kulingana na bajeti yako ndani ya dakika chache.
            </DialogDescription>
          </DialogHeader>
          <Button
            className="w-full bg-cta hover:bg-cta/90 text-cta-foreground font-bold text-sm"
            size="sm"
            onClick={() => {
              setShowUpsell(false);
              navigate("/omba-nafasi");
            }}
          >
            🚀 Pata Sasa Hivi
          </Button>
        </DialogContent>
      </Dialog>

      {/* Paywall from sidebar CTA */}
      <PaywallDialog
        open={showPaywall}
        onOpenChange={setShowPaywall}
      />

      <Footer />
    </div>
  );
};

export default SchoolProfile;
