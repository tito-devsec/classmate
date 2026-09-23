import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Building2, CheckCircle, Globe, GraduationCap, Search, SlidersHorizontal, WifiOff, X } from "lucide-react";
import { SchoolCard } from "@/components/SchoolCard";
import { CollegeCard } from "@/components/CollegeCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useColleges, useRegions, useSchools } from "@/hooks/useSchools";
import type { SchoolQuery } from "@/services/schools";

type Category = "schools" | "colleges" | "study-abroad";

const levels = ["O-Level", "A-Level"] as const;
const boardingTypes = ["Boarding", "Day"] as const;
const genders = ["Boys", "Girls", "Mixed"] as const;

const sortOptions: { value: NonNullable<SchoolQuery["sort"]>; label: string }[] = [
  { value: "rating", label: "Wastani wa juu" },
  { value: "results", label: "Matokeo bora" },
  { value: "fee-asc", label: "Ada ndogo kwanza" },
  { value: "fee-desc", label: "Ada kubwa kwanza" },
  { value: "name", label: "Jina (A–Z)" },
];

const abroadUniversities = [
  { name: "University of Nairobi", country: "Kenya", flag: "🇰🇪", programs: "Medicine, Engineering, Business", tuition: "USD 3,500 - 6,000 / mwaka", img: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&q=80" },
  { name: "Makerere University", country: "Uganda", flag: "🇺🇬", programs: "Law, IT, Agriculture", tuition: "USD 2,800 - 5,000 / mwaka", img: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=600&q=80" },
  { name: "University of Cape Town", country: "South Africa", flag: "🇿🇦", programs: "Engineering, Commerce, Health", tuition: "USD 6,000 - 9,500 / mwaka", img: "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=600&q=80" },
  { name: "University of Manchester", country: "UK", flag: "🇬🇧", programs: "Business, Sciences, Arts", tuition: "GBP 22,000 - 28,000 / mwaka", img: "https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=600&q=80" },
  { name: "University of Toronto", country: "Canada", flag: "🇨🇦", programs: "Engineering, Medicine, IT", tuition: "CAD 45,000 - 60,000 / mwaka", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80" },
  { name: "Universiti Malaya", country: "Malaysia", flag: "🇲🇾", programs: "IT, Engineering, Business", tuition: "USD 4,500 - 7,500 / mwaka", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80" },
];

const tabs: { id: Category; label: string; icon: typeof GraduationCap }[] = [
  { id: "schools", label: "Shule", icon: GraduationCap },
  { id: "colleges", label: "Vyuo", icon: Building2 },
  { id: "study-abroad", label: "Masomo nje", icon: Globe },
];

const readTab = (value: string | null): Category => {
  if (value === "colleges" || value === "vyuo") return "colleges";
  if (value === "study-abroad" || value === "nje") return "study-abroad";
  return "schools";
};

const SchoolListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState<Category>(readTab(searchParams.get("tab")));
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [level, setLevel] = useState(searchParams.get("level") ?? "");
  const [boarding, setBoarding] = useState(searchParams.get("boarding") ?? "");
  const [gender, setGender] = useState(searchParams.get("gender") ?? "");
  const [sort, setSort] = useState<NonNullable<SchoolQuery["sort"]>>(
    (searchParams.get("sort") as SchoolQuery["sort"]) ?? "rating",
  );
  const [collegeCategory, setCollegeCategory] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [studyAbroadSubmitted, setStudyAbroadSubmitted] = useState(false);

  const minFee = searchParams.get("minFee");
  const maxFee = searchParams.get("maxFee");

  /** Debounced so typing does not fire a request per keystroke. */
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // The URL is the source of truth for a shareable result set.
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "schools") params.set("tab", category);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (region) params.set("region", region);
    if (level) params.set("level", level);
    if (boarding) params.set("boarding", boarding);
    if (gender) params.set("gender", gender);
    if (sort !== "rating") params.set("sort", sort);
    if (minFee) params.set("minFee", minFee);
    if (maxFee) params.set("maxFee", maxFee);
    setSearchParams(params, { replace: true });
  }, [category, debouncedSearch, region, level, boarding, gender, sort, minFee, maxFee, setSearchParams]);

  const { data: regions = [] } = useRegions();

  const { data: schoolPage, isLoading: loadingSchools } = useSchools({
    q: debouncedSearch || undefined,
    region: region || undefined,
    level: (level || undefined) as SchoolQuery["level"],
    gender: (gender || undefined) as SchoolQuery["gender"],
    boarding: (boarding || undefined) as SchoolQuery["boarding"],
    minFee: minFee ? Number(minFee) : undefined,
    maxFee: maxFee ? Number(maxFee) : undefined,
    sort,
    limit: 60,
  });

  const { data: allColleges = [], isLoading: loadingColleges } = useColleges();

  const colleges = useMemo(() => {
    const needle = debouncedSearch.trim().toLowerCase();
    return allColleges.filter((college) => {
      if (collegeCategory && college.category !== collegeCategory) return false;
      if (region && college.region !== region) return false;
      if (!needle) return true;
      return (
        college.name.toLowerCase().includes(needle) ||
        college.location.toLowerCase().includes(needle) ||
        college.programs.some((program) => program.toLowerCase().includes(needle))
      );
    });
  }, [allColleges, collegeCategory, region, debouncedSearch]);

  const schools = schoolPage?.items ?? [];
  const totalResults = category === "schools" ? (schoolPage?.total ?? schools.length) : colleges.length;
  const loading = category === "schools" ? loadingSchools : loadingColleges;

  const activeFilters = [region, level, boarding, gender, collegeCategory].filter(Boolean).length + (minFee ? 1 : 0);

  const clearFilters = () => {
    setRegion("");
    setLevel("");
    setBoarding("");
    setGender("");
    setCollegeCategory("");
    const params = new URLSearchParams(searchParams);
    params.delete("minFee");
    params.delete("maxFee");
    setSearchParams(params, { replace: true });
  };

  const handleStudyAbroadSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setStudyAbroadSubmitted(true);
    console.log("[Classmate Track] study_abroad_form_submitted", { timestamp: Date.now() });
  };

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[13px] font-medium transition ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-card text-foreground hover:border-foreground/30"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={
          category === "schools"
            ? "Shule za Sekondari Tanzania — O-Level & A-Level | Classmate"
            : category === "colleges"
              ? "Vyuo Binafsi Tanzania — Diploma & Certificate | Classmate"
              : "Masomo Nje ya Nchi — Vyuo vya Kimataifa | Classmate"
        }
        description={
          category === "schools"
            ? "Orodha kamili ya shule bora za sekondari Tanzania — chuja kwa mkoa, jinsia, bweni na ada. Linganisha na omba nafasi."
            : category === "colleges"
              ? "Vyuo binafsi vya Tanzania — Diploma na Certificate. Chuja kwa eneo na bei. Pata ushauri bure."
              : "Vyuo vya kimataifa unavyoweza kuomba kupitia Classmate — UK, USA, Canada, India, Malaysia na zaidi."
        }
        path="/shule"
      />
      <Navbar />

      {/* Page head */}
      <section className="border-b border-border/70 bg-card">
        <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 sm:py-14">
          <p className="eyebrow">Orodha ya Classmate</p>
          <h1 className="display-lg mt-2 text-foreground">
            {category === "schools"
              ? "Shule za sekondari Tanzania"
              : category === "colleges"
                ? "Vyuo na taasisi za ufundi"
                : "Masomo nje ya nchi"}
          </h1>
          <p className="mt-3 max-w-2xl text-[0.9375rem] text-muted-foreground">
            {category === "study-abroad"
              ? "Vyuo vya kimataifa unavyoweza kuomba kupitia Classmate — tunakuongoza hatua kwa hatua."
              : "Chuja kwa mkoa, kiwango, jinsia na ada. Taarifa zote ni za bure kwa wazazi."}
          </p>

          <div className="mt-7 inline-flex rounded-full bg-muted p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategory(tab.id);
                  setSearch("");
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition sm:px-5 ${
                  category === tab.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {category !== "study-abroad" && (
        <>
          {/* Search + filters */}
          <section className="sticky top-[72px] z-30 border-b border-border/70 bg-background/95 backdrop-blur">
            <div className="mx-auto max-w-[1320px] px-4 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-0 flex-1 sm:max-w-md">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={category === "schools" ? "Tafuta shule au mkoa…" : "Tafuta chuo au programu…"}
                    aria-label="Tafuta"
                    className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[0.9375rem] outline-none ring-primary/25 focus:ring-2"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFiltersOpen((value) => !value)}
                  className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-5 text-[0.9375rem] font-medium transition hover:border-foreground/30"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Vichujio
                  {activeFilters > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                      {activeFilters}
                    </span>
                  )}
                </button>

                {category === "schools" && (
                  <label className="ml-auto hidden items-center gap-2 text-[13px] text-muted-foreground sm:flex">
                    Panga:
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value as NonNullable<SchoolQuery["sort"]>)}
                      className="h-12 rounded-full border border-border bg-card px-4 text-[0.9375rem] font-medium text-foreground outline-none"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {filtersOpen && (
                <div className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-4">
                  <div>
                    <p className="mb-2 text-[13px] font-semibold text-foreground">Mkoa</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={chip(!region)} onClick={() => setRegion("")}>
                        Yote
                      </button>
                      {regions.map((entry) => (
                        <button
                          key={entry.name}
                          type="button"
                          className={chip(region === entry.name)}
                          onClick={() => setRegion(region === entry.name ? "" : entry.name)}
                        >
                          {entry.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {category === "schools" ? (
                    <>
                      <div>
                        <p className="mb-2 text-[13px] font-semibold text-foreground">Kiwango</p>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={chip(!level)} onClick={() => setLevel("")}>
                            Vyote
                          </button>
                          {levels.map((entry) => (
                            <button
                              key={entry}
                              type="button"
                              className={chip(level === entry)}
                              onClick={() => setLevel(level === entry ? "" : entry)}
                            >
                              {entry}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[13px] font-semibold text-foreground">Aina</p>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={chip(!boarding)} onClick={() => setBoarding("")}>
                            Zote
                          </button>
                          {boardingTypes.map((entry) => (
                            <button
                              key={entry}
                              type="button"
                              className={chip(boarding === entry)}
                              onClick={() => setBoarding(boarding === entry ? "" : entry)}
                            >
                              {entry === "Boarding" ? "Bweni" : "Kutwa"}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[13px] font-semibold text-foreground">Jinsia</p>
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className={chip(!gender)} onClick={() => setGender("")}>
                            Zote
                          </button>
                          {genders.map((entry) => (
                            <button
                              key={entry}
                              type="button"
                              className={chip(gender === entry)}
                              onClick={() => setGender(gender === entry ? "" : entry)}
                            >
                              {entry === "Boys" ? "Wavulana" : entry === "Girls" ? "Wasichana" : "Mchanganyiko"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="mb-2 text-[13px] font-semibold text-foreground">Aina ya chuo</p>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className={chip(!collegeCategory)} onClick={() => setCollegeCategory("")}>
                          Vyote
                        </button>
                        {["Institute", "College"].map((entry) => (
                          <button
                            key={entry}
                            type="button"
                            className={chip(collegeCategory === entry)}
                            onClick={() => setCollegeCategory(collegeCategory === entry ? "" : entry)}
                          >
                            {entry === "Institute" ? "Taasisi" : "Chuo"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeFilters > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
                    >
                      <X className="h-3.5 w-3.5" />
                      Ondoa vichujio vyote
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Results */}
          <section className="py-8 sm:py-10">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <p className="text-[0.9375rem] text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalResults}</span>{" "}
                  {category === "schools" ? "shule zimepatikana" : "vyuo vimepatikana"}
                </p>
                {schoolPage?.offline && category === "schools" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[12px] text-muted-foreground">
                    <WifiOff className="h-3.5 w-3.5" />
                    Orodha iliyohifadhiwa — seva haipatikani
                  </span>
                )}
              </div>

              {loading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="overflow-hidden rounded-[20px] bg-card shadow-sm">
                      <div className="aspect-[16/11] animate-pulse bg-muted" />
                      <div className="space-y-3 p-4">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                        <div className="h-8 w-full animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {category === "schools"
                    ? schools.map((school) => <SchoolCard key={school.id} school={school} />)
                    : colleges.map((college) => <CollegeCard key={college.id} college={college} />)}
                </div>
              )}

              {!loading && totalResults === 0 && (
                <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                  <p className="font-display text-lg font-bold text-foreground">Hakuna matokeo</p>
                  <p className="mt-1 text-[0.9375rem] text-muted-foreground">
                    Jaribu kuondoa baadhi ya vichujio au badilisha maneno ya utafutaji.
                  </p>
                  {activeFilters > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-5 rounded-full bg-primary px-6 py-2.5 text-[0.9375rem] font-semibold text-primary-foreground"
                    >
                      Ondoa vichujio
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Study abroad */}
      {category === "study-abroad" && (
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {abroadUniversities.map((university) => (
                <article
                  key={university.name}
                  className="card-hover group overflow-hidden rounded-[20px] bg-card shadow-[0_2px_14px_-8px_rgba(0,0,0,0.25)]"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <img
                      src={university.img}
                      alt={university.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    <span className="absolute right-3 top-3 rounded-full bg-card px-2.5 py-1 text-[11px] font-semibold shadow-sm">
                      {university.flag} {university.country}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-[1.0625rem] font-bold text-foreground">{university.name}</h3>
                    <p className="mt-1.5 line-clamp-2 text-[13px] text-muted-foreground">{university.programs}</p>
                    <p className="mt-3 font-display text-[0.9375rem] font-bold text-foreground">{university.tuition}</p>
                    <button
                      type="button"
                      onClick={() => document.getElementById("study-abroad-form")?.scrollIntoView({ behavior: "smooth" })}
                      className="mt-4 w-full rounded-full bg-primary py-2.5 text-[13px] font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Omba sasa
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="mx-auto mt-14 max-w-lg text-center">
              <h2 className="display-md text-foreground">Jaza fomu ya maombi</h2>
              <p className="mt-2 text-[0.9375rem] text-muted-foreground">
                Tutakuongoza hatua kwa hatua kwenye chuo unachokitaka.
              </p>
            </div>

            <div id="study-abroad-form" className="mx-auto mt-6 max-w-lg scroll-mt-28">
              {studyAbroadSubmitted ? (
                <div className="animate-fade-in rounded-2xl bg-card p-8 text-center shadow-sm">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">Asante!</h3>
                  <p className="mt-1 text-[0.9375rem] text-muted-foreground">
                    Tutawasiliana nawe hivi karibuni kuhusu fursa za masomo nje ya nchi.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleStudyAbroadSubmit}
                  className="animate-fade-in space-y-4 rounded-2xl bg-card p-6 shadow-sm"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[13px] font-medium text-foreground">Jina kamili *</span>
                      <input
                        required
                        placeholder="Jina lako"
                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-primary/25 focus:ring-2"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-[13px] font-medium text-foreground">Namba ya simu *</span>
                      <input
                        required
                        type="tel"
                        placeholder="+255 7XX XXX XXX"
                        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-primary/25 focus:ring-2"
                      />
                    </label>
                  </div>
                  <label className="block space-y-2">
                    <span className="text-[13px] font-medium text-foreground">Barua pepe *</span>
                    <input
                      required
                      type="email"
                      placeholder="email@example.com"
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-primary/25 focus:ring-2"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-[13px] font-medium text-foreground">Nchi unayoitaka</span>
                    <input
                      placeholder="Mfano: UK, Canada, USA"
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none ring-primary/25 focus:ring-2"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-[13px] font-medium text-foreground">Maelezo mengine</span>
                    <textarea
                      rows={3}
                      placeholder="Kiwango cha masomo, bajeti, n.k."
                      className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none ring-primary/25 focus:ring-2"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-primary py-3 text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Tuma maombi
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default SchoolListing;
