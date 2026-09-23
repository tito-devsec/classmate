import { Star, MapPin, BookOpen, Home, Users, TrendingUp, BadgeCheck, ImagePlus, MousePointerClick, Megaphone, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import schoolImg from "@/assets/school-1.jpg";
import schoolImg2 from "@/assets/school-2.jpg";
import schoolImg3 from "@/assets/school-3.jpg";
import schoolImg4 from "@/assets/school-4.jpg";

// Featured School Package Preview
export function FeaturedSchoolPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Eye className="h-3.5 w-3.5" /> Preview: Jinsi shule yako itaonekana
      </div>
      <div className="relative overflow-hidden rounded-xl border-2 border-primary/30 bg-card shadow-lg">
        {/* Recommended badge */}
        <div className="absolute left-0 top-4 z-10 flex items-center gap-1.5 rounded-r-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md">
          <BadgeCheck className="h-3.5 w-3.5" /> Recommended School
        </div>

        {/* Image with top rank indicator */}
        <div className="relative h-40 overflow-hidden">
          <img src={schoolImg} alt="School preview" className="h-full w-full object-cover" />
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            #1 Top Ranked
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-medium">
            <Star className="h-3 w-3 fill-primary text-primary" /> 4.8
          </div>
          <div className="absolute bottom-3 left-3 flex gap-1">
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">O LEVEL</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">A LEVEL</span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-display text-base font-semibold text-foreground">Bright Academy</h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> Kinondoni, Dar es Salaam
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground"><Home className="h-3 w-3 text-primary" /> Boarding</div>
            <div className="flex items-center gap-1 text-muted-foreground"><Users className="h-3 w-3 text-primary" /> Mixed</div>
            <div className="flex items-center gap-1 text-muted-foreground"><TrendingUp className="h-3 w-3 text-secondary" /> <span className="font-semibold text-secondary">Div I: 72%</span></div>
          </div>

          <p className="mt-2 text-xs font-medium text-primary">💰 TZS 3,500,000 – TZS 5,000,000</p>

          {/* Extended photo gallery */}
          <div className="mt-3">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
              <ImagePlus className="h-3 w-3" /> Photo Gallery
            </div>
            <div className="grid grid-cols-4 gap-1 rounded-md overflow-hidden">
              {[schoolImg, schoolImg2, schoolImg3, schoolImg4].map((img, i) => (
                <img key={i} src={img} alt="" className="h-14 w-full object-cover" />
              ))}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs">Angalia Shule</Button>
            <Button size="sm" className="flex-1 gap-1 text-xs">
              <MousePointerClick className="h-3 w-3" /> Apply Now
            </Button>
          </div>
        </div>

        {/* Glow effect */}
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary/20" />
      </div>
    </div>
  );
}

// Sponsored Promotion Preview
export function SponsoredPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Eye className="h-3.5 w-3.5" /> Preview: Banner yako kwenye Homepage
      </div>

      {/* Banner ad mockup */}
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-md">
        <div className="relative h-36 overflow-hidden">
          <img src={schoolImg2} alt="Banner preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 flex items-center p-5">
            <div className="space-y-2">
              <span className="inline-block rounded bg-accent/90 px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                <Megaphone className="mr-1 inline h-3 w-3" /> SPONSORED
              </span>
              <h3 className="font-display text-lg font-bold text-primary-foreground drop-shadow">Bright Academy</h3>
              <p className="text-xs text-primary-foreground/80">Elimu bora, mazingira salama — Kinondoni, DSM</p>
              <Button size="sm" className="mt-1 gap-1 text-xs h-7">
                <Eye className="h-3 w-3" /> View School Profile
              </Button>
            </div>
          </div>
        </div>
        <div className="px-4 py-2 flex items-center justify-between border-t bg-muted/30">
          <span className="text-[10px] text-muted-foreground">Ad • Inaonekana kwenye Homepage & School Pages</span>
          <span className="text-[10px] text-muted-foreground">📍 Dar es Salaam</span>
        </div>
      </div>
    </div>
  );
}

// Ultimate Campaign Preview
export function UltimateCampaignPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Eye className="h-3.5 w-3.5" /> Preview: Campaign yako ya siku 30
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-secondary/30 bg-card shadow-lg">
        {/* Campaign header */}
        <div className="relative bg-gradient-to-r from-secondary/20 via-primary/10 to-accent/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-secondary" />
            <span className="text-xs font-bold text-secondary">🔥 ADMISSION CAMPAIGN — 30 DAYS</span>
          </div>
        </div>

        {/* Combined features showcase */}
        <div className="p-4 space-y-3">
          {/* Featured listing mini */}
          <div className="flex items-center gap-3 rounded-lg border p-2.5">
            <img src={schoolImg} alt="" className="h-12 w-12 rounded-md object-cover" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-foreground truncate">Bright Academy</h4>
                <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              </div>
              <p className="text-[10px] text-muted-foreground">Kinondoni • O Level & A Level</p>
            </div>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">#1</span>
          </div>

          {/* Banner mini */}
          <div className="relative h-16 overflow-hidden rounded-lg">
            <img src={schoolImg3} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 to-transparent flex items-center px-3">
              <div>
                <p className="text-[10px] text-primary-foreground/70"><Megaphone className="inline h-2.5 w-2.5 mr-0.5" /> Sponsored</p>
                <p className="text-xs font-bold text-primary-foreground">Bright Academy — Enroll Now!</p>
              </div>
            </div>
          </div>

          {/* Social + leads indicators */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">25+</p>
              <p className="text-[10px] text-muted-foreground">Guaranteed Leads</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2.5 text-center">
              <p className="text-lg font-bold text-foreground">📱</p>
              <p className="text-[10px] text-muted-foreground">Social Media Promo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
