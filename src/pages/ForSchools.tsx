import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Users, HeartHandshake, CheckCircle, Shield, BarChart3, Target, Clock, TrendingUp } from "lucide-react";
import { OwnerForm } from "@/components/lead-capture/OwnerForm";
import { SEO } from "@/components/SEO";

const ForSchools = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleOwnerSubmit = () => {
    setSubmitted(true);
    toast({
      title: "Registration Received!",
      description: "Our team will contact you within 24 hours.",
    });
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Kwa Shule — Ongeza Udahili kupitia Classmate"
        description="Shule binafsi: pata wazazi serious wanaotafuta shule. Packages za partnership, leads za ubora wa juu, na dashboard ya kufuatilia."
        path="/kwa-shule"
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-secondary py-20">
        <div className="container text-center">
          <h1 className="font-display text-3xl font-bold text-secondary-foreground md:text-5xl">
            We Help You Reach Parents Looking for Schools
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-secondary-foreground/80">
            Classmate connects schools and colleges with families searching for quality education. We're here to help you grow.
          </p>
        </div>
      </section>

      {/* How it Works - Pain point focused */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-center font-display text-3xl font-bold text-foreground">How It Works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            We solve the biggest challenges schools and colleges face when trying to attract new students.
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { icon: Target, title: "Struggling to Find Students?", desc: "We bring verified parents directly to you — no more spending on ads that don't convert." },
              { icon: Clock, title: "Wasting Time on Unqualified Leads?", desc: "Every lead is screened and matched to your school's profile, so you only talk to serious families." },
              { icon: TrendingUp, title: "Want to Grow Enrollment?", desc: "We handle marketing and parent outreach so you can focus on what matters — delivering quality education." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border bg-card p-6 text-center card-hover">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="register" className="hero-gradient py-16">
        <div className="container max-w-2xl">
          <h2 className="text-center font-display text-3xl font-bold text-primary-foreground">
            Register Your School or College
          </h2>
          <p className="mt-3 text-center text-primary-foreground/80">
            Fill out this form and our team will reach out to get you started.
          </p>
          <div className="mt-8">
            {submitted ? (
              <div className="rounded-lg bg-card p-10 text-center">
                <CheckCircle className="mx-auto h-16 w-16 text-secondary" />
                <h3 className="mt-4 font-display text-2xl font-bold text-foreground">Thank You!</h3>
                <p className="mt-2 text-muted-foreground">
                  Your registration has been received. Our team will contact you shortly.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-card p-6 shadow-lg">
                <OwnerForm onSubmit={handleOwnerSubmit} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Classmate */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Why Classmate?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Trusted by schools and colleges across Tanzania.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Shield, title: "Verified Parents", desc: "Every parent is screened before being connected to you." },
              { icon: Users, title: "Dedicated Support", desc: "Our team walks with you every step of the way." },
              { icon: BarChart3, title: "Tracking Dashboard", desc: "See your leads, enrollments, and performance in real time." },
              { icon: HeartHandshake, title: "Fair & Transparent", desc: "No hidden fees. You only pay for real results." },
            ].map((b) => (
              <div key={b.title} className="rounded-lg border bg-card p-5 card-hover">
                <b.icon className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 font-medium text-foreground">{b.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForSchools;
