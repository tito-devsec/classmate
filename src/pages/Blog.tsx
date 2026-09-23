import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, User, ExternalLink } from "lucide-react";
import { SEO } from "@/components/SEO";

const nectaLinks = {
  oLevel: [
    { year: "2025", url: "https://matokeo.necta.go.tz/results/2025/csee/index.htm" },
    { year: "2024", url: "https://onlinesys.necta.go.tz/results/2024/csee/index.htm" },
    { year: "2023", url: "https://onlinesys.necta.go.tz/results/2023/csee/index.htm" },
    { year: "2022", url: "https://onlinesys.necta.go.tz/results/2022/csee/index.htm" },
  ],
  aLevel: [
    { year: "2025", url: "https://matokeo.necta.go.tz/results/2025/acsee/index.htm" },
    { year: "2024", url: "https://onlinesys.necta.go.tz/results/2024/acsee/index.htm" },
    { year: "2023", url: "https://onlinesys.necta.go.tz/results/2023/acsee/index.htm" },
    { year: "2022", url: "https://onlinesys.necta.go.tz/results/2022/acsee/index.htm" },
  ],
};

const blogPosts = [
  {
    id: "1",
    title: "Jinsi ya Kuchagua Shule Bora kwa Mtoto Wako",
    excerpt: "Mambo muhimu ya kuzingatia unapochagua shule ya sekondari - kutoka vifaa, walimu, hadi mazingira ya kujifunzia.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    author: "Classmate Team",
    date: "2026-03-05",
    readTime: "5 min",
    category: "Ushauri",
  },
  {
    id: "2",
    title: "O-Level vs A-Level: Tofauti na Faida Zake",
    excerpt: "Elewa tofauti kati ya O-Level na A-Level Tanzania na jinsi ya kusaidia mtoto wako kuchagua njia sahihi.",
    image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&q=80",
    author: "Classmate Team",
    date: "2026-03-01",
    readTime: "7 min",
    category: "Elimu",
  },
  {
    id: "3",
    title: "Boarding vs Day School: Ipi ni Bora?",
    excerpt: "Linganisha faida na changamoto za shule za bweni na za kutwa ili ufanye uamuzi sahihi kwa familia yako.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&q=80",
    author: "Classmate Team",
    date: "2026-02-25",
    readTime: "6 min",
    category: "Ushauri",
  },
  {
    id: "4",
    title: "Matokeo ya NECTA 2025: Uchambuzi Kamili",
    excerpt: "Angalia uchambuzi wa kina wa matokeo ya mitihani ya taifa na shule zilizofanya vizuri zaidi mwaka huu.",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&q=80",
    author: "Classmate Team",
    date: "2026-02-18",
    readTime: "8 min",
    category: "Matokeo",
  },
  {
    id: "5",
    title: "Jinsi Wazazi Wanavyoweza Kusaidia Mtoto Kufaulu",
    excerpt: "Mbinu za kisaikolojia na kitaaluma ambazo wazazi wanaweza kutumia kusaidia watoto wao kufanya vizuri shuleni.",
    image: "https://images.unsplash.com/photo-1491308056676-205b7c9a7dc1?w=600&q=80",
    author: "Classmate Team",
    date: "2026-02-10",
    readTime: "5 min",
    category: "Ushauri",
  },
  {
    id: "6",
    title: "Shule za Kisasa Tanzania: Teknolojia Darasani",
    excerpt: "Jinsi shule za Tanzania zinavyotumia teknolojia kuboresha ufundishaji na matokeo ya wanafunzi.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
    author: "Classmate Team",
    date: "2026-02-03",
    readTime: "6 min",
    category: "Elimu",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog — Ushauri wa Elimu & Uchaguzi wa Shule | Classmate"
        description="Makala za ushauri kuhusu kuchagua shule, maandalizi ya mitihani, A-Level combinations na matokeo ya NECTA Tanzania."
        path="/blog"
      />
      <Navbar />

      {/* Hero */}
      <section className="border-b bg-card py-16">
        <div className="container text-center">
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Blog ya Classmate
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Habari, ushauri, na maarifa kuhusu elimu ya sekondari Tanzania
          </p>
        </div>
      </section>

      {/* NECTA Results Section */}
      <section className="border-b bg-secondary/30 py-10">
        <div className="container">
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-foreground">
            📊 Matokeo ya NECTA - Angalia Hapa
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* O-Level */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                O-Level (CSEE) Results
              </h3>
              <div className="space-y-3">
                {nectaLinks.oLevel.map((item) => (
                  <a
                    key={item.year}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border bg-background p-3 transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <span className="font-medium text-foreground">
                      Matokeo CSEE {item.year}
                    </span>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </a>
                ))}
              </div>
            </div>

            {/* A-Level */}
            <div className="rounded-xl border bg-card p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                A-Level (ACSEE) Results
              </h3>
              <div className="space-y-3">
                {nectaLinks.aLevel.map((item) => (
                  <a
                    key={item.year}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border bg-background p-3 transition-colors hover:border-primary hover:bg-primary/5"
                  >
                    <span className="font-medium text-foreground">
                      Matokeo ACSEE {item.year}
                    </span>
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Chanzo: <a href="https://www.necta.go.tz" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">NECTA - National Examinations Council of Tanzania</a>
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12">
        <div className="container">
          {/* Featured Post */}
          <div className="mb-12 overflow-hidden rounded-xl border bg-card">
            <div className="grid md:grid-cols-2">
              <div className="aspect-video md:aspect-auto">
                <img
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-10">
                <span className="inline-block w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {blogPosts[0].category}
                </span>
                <h2 className="mt-3 font-display text-2xl font-bold text-foreground md:text-3xl">
                  {blogPosts[0].title}
                </h2>
                <p className="mt-3 text-muted-foreground">{blogPosts[0].excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {blogPosts[0].author}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {blogPosts[0].readTime}</span>
                </div>
                <Button className="mt-6 w-fit gap-2">
                  Soma Zaidi <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="group overflow-hidden rounded-lg border bg-card card-hover">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {post.category}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-foreground line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
