import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Sparkles, Award } from "lucide-react";
import { Link } from "react-router-dom";

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const packages = [
  {
    id: "mikumi",
    name: "MIKUMI PACKAGE",
    price: "3,000",
    color: "border-green-500/40 bg-green-100",
    iconColor: "text-green-600",
    icon: CheckCircle,
    badge: null,
    tagline: "Tathmini ya msingi kwa mzazi anayetaka mwongozo wa haraka.",
    features: [
      "Unapewa shule 2 zinazokufaa",
      "Uchaguzi kulingana na bajeti, eneo na mahitaji ya mtoto",
      "Overview (profile) kwa kila shule",
    ],
  },
  {
    id: "serengeti",
    name: "SERENGETI PACKAGE",
    price: "5,000",
    color: "border-primary/40 bg-blue-100",
    iconColor: "text-primary",
    icon: Star,
    badge: "Most Popular",
    tagline: "Tathmini yenye uchambuzi na uwezo wa kulinganisha chaguo zako.",
    features: [
      "Chaguo la shule 4 zinazokufaa",
      "Comparison tool (Unalinganisha shule moja na nyingine)",
      "Overview (profile) kwa kila shule",
    ],
  },
  {
    id: "ngorongoro",
    name: "NGORONGORO PACKAGE",
    price: "10,000",
    color: "border-purple-500/40 bg-purple-100",
    iconColor: "text-purple-600",
    icon: Award,
    badge: "Recommended",
    tagline: "Ushauri binafsi kwa mzazi anayetaka kufanya uamuzi sahihi bila makosa.",
    features: [
      "Chaguo la hadi shule 10 zinazokufaa",
      "Advanced comparison tool",
      "Ushauri binafsi kupitia Assistance Desk (WhatsApp / Simu)",
      "Msaada wa kufanya uamuzi wa mwisho",
    ],
  },
];

export function PaywallDialog({ open, onOpenChange }: PaywallDialogProps) {
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

  const handleSelect = (pkgId: string) => {
    setSelectedPkg(pkgId);
    console.log("[Classmate Track] package_selected", { package: pkgId, timestamp: Date.now() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] sm:max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border-none bg-transparent shadow-none p-2 gap-2">
        <DialogHeader className="sr-only">
          <DialogTitle>Chagua Package</DialogTitle>
          <DialogDescription>Chagua kiwango cha tathmini kinachokufaa</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            const isSelected = selectedPkg === pkg.id;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-xl border-2 p-3 transition-all cursor-pointer shadow-lg ${pkg.color} ${
                  isSelected ? "ring-2 ring-primary shadow-xl scale-[1.02]" : "hover:shadow-md"
                }`}
                onClick={() => handleSelect(pkg.id)}
              >
                {pkg.badge && (
                  <span className="absolute -top-2 right-2.5 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
                    {pkg.badge}
                  </span>
                )}
                <div className="flex items-start gap-2">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${pkg.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1">
                      <h4 className="font-display text-xs font-bold text-foreground">{pkg.name}</h4>
                      <span className="font-display text-sm font-bold text-foreground whitespace-nowrap">
                        TZS {pkg.price}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">{pkg.tagline}</p>
                    <ul className="mt-1.5 space-y-0.5">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-1 text-[10px] text-foreground/80 leading-tight">
                          <CheckCircle className="h-2.5 w-2.5 mt-0.5 shrink-0 text-success" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-1">
          {selectedPkg ? (
            <Link to={`/omba-nafasi?package=${selectedPkg}`} className="block">
              <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground font-bold rounded-xl text-sm" size="default">
                Chagua — Endelea
              </Button>
            </Link>
          ) : (
            <Button className="w-full rounded-xl text-sm" size="default" disabled>
              Chagua package hapo juu
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
