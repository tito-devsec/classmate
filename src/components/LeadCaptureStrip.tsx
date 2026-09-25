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
import { useT } from "@/i18n";

export const LeadCaptureStrip = () => {
  const [expanded, setExpanded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { toast } = useToast();
  const t = useT();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowOptions(true);
    console.log("[Classmate Track] lead_form_submitted", { timestamp: Date.now() });
  };

  const handleFreeOption = () => {
    setShowOptions(false);
    setSubmitted(true);
    toast({
      title: t("lead.sent"),
      description: t("lead.sentBody"),
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
            {t("lead.thanks")}
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
                {t("lead.headline")}
              </p>
              <p className="text-xs text-primary-foreground/70">
                {t("lead.subline")}
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
            <span className="hidden sm:inline">{t("lead.cta")}</span>
            <span className="sm:hidden">{t("lead.ctaShort")}</span>
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
                  <p className="text-[10px] text-muted-foreground leading-tight">{t("lead.answersWithin")}</p>
                  <h4 className="font-display text-sm font-bold text-foreground mt-0.5">{t("lead.fiveMinutes")}</h4>
                  <Button className="w-full mt-2 bg-cta hover:bg-cta/90 text-cta-foreground font-bold text-[11px] h-8" size="sm">
                    {t("lead.choosePackage")}
                  </Button>
                </div>

                <div
                  className="rounded-xl border-2 border-muted bg-muted/30 p-3 cursor-pointer hover:shadow-lg transition-all text-center shadow-md w-[170px]"
                  onClick={handleFreeOption}
                >
                  <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                  <p className="text-[10px] text-muted-foreground leading-tight">{t("lead.answersWithin")}</p>
                  <h4 className="font-display text-sm font-bold text-foreground mt-0.5">{t("lead.24hours")}</h4>
                  <Button variant="outline" className="w-full mt-2 text-[11px] h-8" size="sm">
                    {t("lead.continueFree")}
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
                    <Label className="text-sm font-medium">{t("lead.parentName")}</Label>
                    <Input required placeholder={t("lead.parentNamePlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("lead.phone")}</Label>
                    <Input required type="tel" placeholder="+255 7XX XXX XXX" />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("lead.lookingFor")}</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="O-Level / A-Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="O-Level">{t("lead.oLevel")}</SelectItem>
                        <SelectItem value="A-Level">{t("lead.aLevel")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("lead.studentFrom")}</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder={t("lead.homeRegion")} />
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
                    <Label className="text-sm font-medium">{t("lead.schoolRegion")}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t("lead.chooseRegion")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t("lead.anywhere")}</SelectItem>
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
                    <Label className="text-sm font-medium">{t("lead.form")}</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder={t("lead.chooseForm")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t("lead.formN", { n: 1 })}</SelectItem>
                        <SelectItem value="2">{t("lead.formN", { n: 2 })}</SelectItem>
                        <SelectItem value="3">{t("lead.formN", { n: 3 })}</SelectItem>
                        <SelectItem value="4">{t("lead.formN", { n: 4 })}</SelectItem>
                        <SelectItem value="5">{t("lead.formN", { n: 5 })}</SelectItem>
                        <SelectItem value="6">{t("lead.formN", { n: 6 })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium whitespace-nowrap">{t("lead.schoolType")}</Label>
                    <Select>
                      <SelectTrigger className="min-w-0">
                        <SelectValue placeholder={t("lead.boardingDay")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Boarding">{t("lead.boarding")}</SelectItem>
                        <SelectItem value="Day">{t("lead.day")}</SelectItem>
                        <SelectItem value="Both">{t("lead.any")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-cta hover:bg-cta/90 text-cta-foreground text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  {t("lead.cta")}
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