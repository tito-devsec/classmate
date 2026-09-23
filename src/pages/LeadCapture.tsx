import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Zap, Clock } from "lucide-react";
import { ParentForm } from "@/components/lead-capture/ParentForm";
import { PaywallDialog } from "@/components/PaywallDialog";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";

const LeadCapture = () => {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const initialCategory = typeParam === "college" ? "College" : "";
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [submittedCollege, setSubmittedCollege] = useState(false);

  const handleParentSubmit = (isCollege: boolean) => {
    setSubmittedCollege(isCollege);
    setShowOptions(true);
    console.log("[Classmate Track] form_submitted", { type: isCollege ? "college" : "school", timestamp: Date.now() });
  };

  const handleFreeOption = () => {
    setShowOptions(false);
    setSubmitted(true);
    toast({
      title: "Maombi yamepokelewa!",
      description: submittedCollege
        ? "Tutakutumia mapendekezo ya vyuo ndani ya masaa 24."
        : "Tutawasiliana nawe ndani ya masaa 24.",
    });
    console.log("[Classmate Track] free_option_selected", { timestamp: Date.now() });
  };

  const handlePaidOption = () => {
    setShowPaywall(true);
    console.log("[Classmate Track] paid_option_selected", { timestamp: Date.now() });
  };

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-20 text-center">
          <CheckCircle className="h-16 w-16 text-secondary" />
          <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Asante Sana!</h1>
          <p className="mt-2 text-muted-foreground">
            {submittedCollege
              ? "Maombi yako yamepokelewa. Tutakutumia mapendekezo ya vyuo ndani ya masaa 24."
              : "Maombi yako yamepokelewa. Tutakutumia mapendekezo ya shule ndani ya masaa 24."}
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (showOptions) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="hero-gradient py-12">
          <div className="container text-center">
            <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Maombi Yako Yamepokelewa!
            </h1>
            <p className="mt-2 text-primary-foreground/80">
              Chagua jinsi unavyotaka kupata mapendekezo yako
            </p>
          </div>
        </section>
        <section className="py-10">
          <div className="container max-w-2xl">
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                onClick={handlePaidOption}
                className="cursor-pointer rounded-xl border-2 border-primary/30 bg-primary/5 p-6 text-center transition-all hover:shadow-lg hover:border-primary/60"
              >
                <Zap className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                  ⚡ Pata Majibu ndani ya Dakika 5
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Chagua package na upate mapendekezo ya shule bora mara moja
                </p>
                <Button className="mt-4 w-full bg-cta hover:bg-cta/90 text-cta-foreground font-bold">
                  Chagua Package
                </Button>
              </div>

              <div
                onClick={handleFreeOption}
                className="cursor-pointer rounded-xl border-2 border-muted bg-muted/30 p-6 text-center transition-all hover:shadow-lg hover:border-muted-foreground/30"
              >
                <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                  🕒 Pata Majibu ndani ya Masaa 24
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tutakupigia simu na kukusaidia kupata shule bora
                </p>
                <Button variant="outline" className="mt-4 w-full font-bold">
                  Endelea Bure
                </Button>
              </div>
            </div>
          </div>
        </section>
        <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO
        title="Omba Nafasi — Pata Mapendekezo ya Shule Bure | Classmate"
        description="Jaza fomu fupi: kategoria, mkoa, ada na mahitaji. Tutakutumia mapendekezo ya shule au vyuo bora ndani ya masaa 24 — bure kabisa."
        path="/omba-nafasi"
      />
      <Navbar />

      <section className="hero-gradient py-12">
        <div className="container text-center">
          <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Omba Nafasi ya Shule au Chuo
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            Jaza fomu hii na tutakupendekezea shule/vyuo bora
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container max-w-2xl">
          <ParentForm onSubmit={handleParentSubmit} initialCategory={initialCategory} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LeadCapture;
