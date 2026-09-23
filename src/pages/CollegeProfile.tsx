import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Mail, Star, BookOpen, CheckCircle, ArrowLeft, DollarSign, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { colleges as seedColleges, formatTZS } from "@/data/schools";
import { SEO } from "@/components/SEO";
import { useCollege } from "@/hooks/useSchools";

const CollegeProfile = () => {
  const { id } = useParams();
  // Live record when the API serves colleges; bundled catalogue until it does.
  const { data: fetched } = useCollege(id);
  const college = fetched ?? seedColleges.find((c) => c.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!college) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="font-display text-2xl font-bold">Chuo hakijapatikana</h1>
          <Link to="/shule?tab=colleges" className="mt-4 inline-block text-primary hover:underline">
            Rudi kwenye Vyuo
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title={`${college.name} — ${college.location} | Classmate`}
        description={`${college.name} ni chuo binafsi kilichopo ${college.location}. Tazama kozi, ada, picha na omba nafasi kupitia Classmate.`}
        path={`/chuo/${college.id}`}
        type="product"
        image={college.image}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollegeOrUniversity",
          name: college.name,
          description: `Chuo binafsi kilichopo ${college.location}, Tanzania.`,
          url: `https://classmate.co.tz/chuo/${college.id}`,
          address: { "@type": "PostalAddress", addressLocality: college.location, addressCountry: "TZ" },
          image: college.image,
        }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative h-72 md:h-80 overflow-hidden">
        {college.image ? (
          <img src={college.image} alt={college.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full bg-gradient-to-br from-accent/30 to-primary/30 flex items-center justify-center">
            <BookOpen className="h-24 w-24 text-accent/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0">
          <div className="container">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-background">{college.name}</h1>
            <p className="mt-1 flex items-center gap-1 text-background/80">
              <MapPin className="h-4 w-4" /> {college.location}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <Link to="/shule?tab=colleges" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Rudi kwenye Vyuo
          </Link>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 rounded-lg border bg-card p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Star className="h-4 w-4 fill-primary" />
                <span className="font-display text-xl font-bold">{college.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{college.category}</p>
              <p className="text-xs text-muted-foreground">Aina</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{college.type}</p>
              <p className="text-xs text-muted-foreground">Umiliki</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{college.programs.length}</p>
              <p className="text-xs text-muted-foreground">Programu</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Overview */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Kuhusu Chuo</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{college.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">{college.category}</span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">{college.type}</span>
                </div>
              </div>

              {/* Programs */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Programu za Masomo</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {college.programs.map((p) => (
                    <span key={p} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                      <CheckCircle className="h-3.5 w-3.5" /> {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="font-display text-xl font-semibold text-foreground">Vifaa na Mazingira</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {college.facilities.map((f) => (
                    <div key={f} className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-success" /> {f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos placeholder */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <Camera className="h-5 w-5 text-primary" /> Picha za Chuo
                </h2>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Campus", "Madarasa", "Maabara", "Maktaba", "Hosteli", "Canteen"].map((label) => (
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
                <div className="rounded-lg border bg-card p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <DollarSign className="h-5 w-5 text-primary" /> Ada za Chuo
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <span className="text-sm text-muted-foreground">Kiwango cha Chini</span>
                      <span className="font-semibold text-foreground">{formatTZS(college.tuitionMin)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                      <span className="text-sm text-muted-foreground">Kiwango cha Juu</span>
                      <span className="font-semibold text-foreground">{formatTZS(college.tuitionMax)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground">Ada kwa mwaka (2026)</p>
                    </div>
                  </div>

                  <Link to="/omba-nafasi?type=college" className="mt-4 block">
                    <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground" size="lg">Apply Sasa</Button>
                  </Link>
                </div>

                <div className="rounded-lg border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold text-foreground">Mawasiliano</h3>
                  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {college.phone}</p>
                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {college.email}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {college.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollegeProfile;
