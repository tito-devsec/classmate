import { useState } from "react";
import { ChevronDown, Phone, Star, Sparkles, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PaywallDialog } from "@/components/PaywallDialog";

export const LeadCaptureStrip = () => {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowOptions(true);
    console.log("[Classmate Track] lead_form_submitted", { timestamp: Date.now() });
  };

  const handleFreeOption = () => {
    setShowOptions(false);
    setSubmitted(true);
    toast({
      title: "Fomu Imetumwa!",
      description: "Tutawasiliana nawe ndani ya masaa 24.",
    });
    console.log("[Classmate Track] free_option_selected", { timestamp: Date.now() });
  };

  const handlePaidOption = () => {
    setShowOptions(false);
    setShowPaywall(true);
    console.log("[Classmate Track] paid_option_selected", { timestamp: Date.now() });
  };

  if (submitted) {
    return (
      <section className="py-8 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
        <div className="container flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
            <Star className="h-5 w-5 text-success" />
          </div>
          <p className="font-display text-lg font-semibold text-foreground">
            Asante! Tutawasiliana nawe hivi karibuni.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <div
        className="group cursor-pointer bg-gradient-to-r from-primary via-primary/90 to-primary py-4 transition-all duration-300 hover:py-5"
        onClick={() => !expanded && setExpanded(true)}
      >
        <div className="container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-primary-foreground sm:text-base">
                Unatafuta shule sahihi kwa mtoto wako?
              </p>
              <p className="text-xs text-primary-foreground/70">
                Jaza fomu fupi — tutakupigia simu ndani ya saa 24
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="shrink-0 gap-1.5 font-semibold"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nisaidie Kupata Shule</span>
            <span className="sm:hidden">Jaza Fomu</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          expanded ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-gradient-to-b from-primary/5 to-background py-8">
          <div className="container max-w-2xl">
            {showOptions ? (
              <div className="flex gap-3 justify-center animate-fade-in">
                <div
                  className="rounded-xl border-2 border-primary/40 bg-primary/5 p-3 cursor-pointer hover:shadow-lg transition-all text-center shadow-md w-[170px]"
                  onClick={handlePaidOption}
                >
                  <Zap className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Pata Majibu ndani ya</p>
                  <h4 className="font-display text-sm font-bold text-foreground mt-0.5">⚡ Dakika 5</h4>
                  <Button className="w-full mt-2 bg-cta hover:bg-cta/90 text-cta-foreground font-bold text-[11px] h-8" size="sm">
                    Chagua Package
                  </Button>
                </div>

                <div
                  className="rounded-xl border-2 border-muted bg-muted/30 p-3 cursor-pointer hover:shadow-lg transition-all text-center shadow-md w-[170px]"
                  onClick={handleFreeOption}
                >
                  <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">Pata Majibu ndani ya</p>
                  <h4 className="font-display text-sm font-bold text-foreground mt-0.5">🕒 Masaa 24</h4>
                  <Button variant="outline" className="w-full mt-2 text-[11px] h-8" size="sm">
                    Endelea Bure
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border bg-card p-6 shadow-lg animate-fade-in"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Jina la Mzazi *</Label>
                    <Input required placeholder="Jina lako kamili" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Namba ya Simu *</Label>
                    <Input required type="tel" placeholder="+255 7XX XXX XXX" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mtoto anatafuta *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="O-Level / A-Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O-Level">O-Level (Kidato 1-4)</SelectItem>
                        <SelectItem value="A-Level">A-Level (Kidato 5-6)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mwanafunzi Anatokea Wapi? *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Mkoa anaotokea" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dar">Dar es Salaam</SelectItem>
                        <SelectItem value="pwani">Pwani</SelectItem>
                        <SelectItem value="arusha">Arusha</SelectItem>
                        <SelectItem value="kilimanjaro">Kilimanjaro</SelectItem>
                        <SelectItem value="tanga">Tanga</SelectItem>
                        <SelectItem value="mwanza">Mwanza</SelectItem>
                        <SelectItem value="dodoma">Dodoma</SelectItem>
                        <SelectItem value="morogoro">Morogoro</SelectItem>
                        <SelectItem value="mbeya">Mbeya</SelectItem>
                        <SelectItem value="iringa">Iringa</SelectItem>
                        <SelectItem value="kagera">Kagera</SelectItem>
                        <SelectItem value="tabora">Tabora</SelectItem>
                        <SelectItem value="kigoma">Kigoma</SelectItem>
                        <SelectItem value="shinyanga">Shinyanga</SelectItem>
                        <SelectItem value="simiyu">Simiyu</SelectItem>
                        <SelectItem value="geita">Geita</SelectItem>
                        <SelectItem value="mara">Mara</SelectItem>
                        <SelectItem value="singida">Singida</SelectItem>
                        <SelectItem value="zanzibar">Zanzibar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Mkoa wa Shule Anayoitaka</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Chagua mkoa (si lazima)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Popote Tanzania</SelectItem>
                        <SelectItem value="dar">Dar es Salaam</SelectItem>
                        <SelectItem value="pwani">Pwani</SelectItem>
                        <SelectItem value="arusha">Arusha</SelectItem>
                        <SelectItem value="kilimanjaro">Kilimanjaro</SelectItem>
                        <SelectItem value="tanga">Tanga</SelectItem>
                        <SelectItem value="mwanza">Mwanza</SelectItem>
                        <SelectItem value="dodoma">Dodoma</SelectItem>
                        <SelectItem value="morogoro">Morogoro</SelectItem>
                        <SelectItem value="mbeya">Mbeya</SelectItem>
                        <SelectItem value="iringa">Iringa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Kidato *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Chagua kidato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Kidato cha 1</SelectItem>
                        <SelectItem value="2">Kidato cha 2</SelectItem>
                        <SelectItem value="3">Kidato cha 3</SelectItem>
                        <SelectItem value="4">Kidato cha 4</SelectItem>
                        <SelectItem value="5">Kidato cha 5</SelectItem>
                        <SelectItem value="6">Kidato cha 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium whitespace-nowrap">Aina ya Shule</Label>
                    <Select>
                      <SelectTrigger className="min-w-0">
                        <SelectValue placeholder="Bweni/Kutwa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Boarding">Bweni (Boarding)</SelectItem>
                        <SelectItem value="Day">Kutwa (Day)</SelectItem>
                        <SelectItem value="Both">Yoyote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-cta hover:bg-cta/90 text-cta-foreground text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  Nisaidie Kupata Shule
                </Button>
              </form>
            )}
            <PaywallDialog open={showPaywall} onOpenChange={setShowPaywall} />
          </div>
        </div>
      </div>
    </section>
  );
};