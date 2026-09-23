import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, X, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { schools as seedSchools, formatTZS } from "@/data/schools";
import type { School } from "@/data/schools";
import { SchoolCard } from "@/components/SchoolCard";
import { SEO } from "@/components/SEO";
import { useSchools } from "@/hooks/useSchools";

const CompareSchools = () => {
  const [selected, setSelected] = useState<School[]>([]);
  const [showPicker, setShowPicker] = useState(true);
  // Live catalogue when the API answers, bundled list when it does not.
  const { data: page } = useSchools({ limit: 60 });
  const schools = page?.items?.length ? page.items : seedSchools;

  const toggleSchool = (school: School) => {
    setSelected((prev) => {
      const exists = prev.find((s) => s.id === school.id);
      if (exists) return prev.filter((s) => s.id !== school.id);
      if (prev.length >= 3) return prev;
      return [...prev, school];
    });
  };

  const removeSchool = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Linganisha Shule — Side by Side | Classmate"
        description="Linganisha shule mbili au zaidi za sekondari Tanzania upande kwa upande: ada, ufaulu, boarding, jinsia na huduma."
        path="/linganisha"
      />
      <Navbar />

      <section className="border-b border-border/70 bg-card">
        <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14">
          <p className="eyebrow">Zana ya wazazi</p>
          <h1 className="display-lg mt-2 text-foreground">Linganisha shule</h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] text-muted-foreground">
            Chagua shule 2–3 uzilinganishe kwa ada, matokeo ya mitihani, aina ya malazi na huduma.
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <Link to="/shule" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Rudi kwenye Orodha
          </Link>

          {/* Selected schools bar */}
          {selected.length > 0 && (
            <div className="mb-6 rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Shule zilizochaguliwa ({selected.length}/3):
                </p>
                {selected.length >= 2 && (
                  <Button size="sm" onClick={() => setShowPicker(false)}>
                    Linganisha Sasa
                  </Button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    {s.name}
                    <button onClick={() => removeSchool(s.id)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Picker or Comparison */}
          {showPicker || selected.length < 2 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Bonyeza "Linganisha" kwenye kadi ya shule ili kuichagua (max 3)
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {schools.map((school) => (
                  <SchoolCard
                    key={school.id}
                    school={school}
                    onCompare={toggleSchool}
                    isComparing={!!selected.find((s) => s.id === school.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="mb-6" onClick={() => setShowPicker(true)}>
                ← Badilisha Shule
              </Button>
              
              {/* Comparison Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse rounded-lg border bg-card">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left text-sm font-semibold text-foreground">Kipengele</th>
                      {selected.map((s) => (
                        <th key={s.id} className="p-4 text-center">
                          <div className="font-display text-sm font-semibold text-foreground">{s.name}</div>
                          <div className="mt-1 flex items-center justify-center gap-1 text-xs text-primary">
                            <Star className="h-3 w-3 fill-primary" /> {s.rating}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 text-sm font-medium text-foreground">📍 Mahali</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center text-sm text-muted-foreground">{s.location}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-4 text-sm font-medium text-foreground">🎓 Level</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center text-sm text-muted-foreground">{s.levels.join(", ")}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-sm font-medium text-foreground">🏫 Aina</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center text-sm text-muted-foreground">{s.boardingDay}</td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-4 text-sm font-medium text-foreground">👦 Jinsia</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center text-sm text-muted-foreground">{s.gender}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-sm font-medium text-foreground">💰 Ada (Boarding)</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center text-sm font-semibold text-primary">
                          {s.feesStructure.boarding ? formatTZS(s.feesStructure.boarding) : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-4 text-sm font-medium text-foreground">💰 Ada (Day)</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center text-sm font-semibold text-primary">
                          {s.feesStructure.day ? formatTZS(s.feesStructure.day) : "—"}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-sm font-medium text-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-success" /> Division I
                        </span>
                      </td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          <span className="font-display text-lg font-bold text-success">{s.performance.divisionI}%</span>
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b bg-muted/30">
                      <td className="p-4 text-sm font-medium text-foreground">Division II</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center text-sm text-muted-foreground">{s.performance.divisionII}%</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 text-sm font-medium text-foreground">Vifaa</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center text-xs text-muted-foreground">
                          {s.facilities.slice(0, 4).join(", ")}
                          {s.facilities.length > 4 && ` +${s.facilities.length - 4}`}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-4 text-sm font-medium text-foreground">CTA</td>
                      {selected.map((s) => (
                        <td key={s.id} className="p-4 text-center">
                          <Link to={`/shule/${s.id}`}>
                            <Button size="sm" className="bg-cta hover:bg-cta/90 text-cta-foreground">Chagua Shule</Button>
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompareSchools;
