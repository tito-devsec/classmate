import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, School } from "lucide-react";

interface OwnerFormProps {
  onSubmit: () => void;
}

export function OwnerForm({ onSubmit }: OwnerFormProps) {
  const [institutionType, setInstitutionType] = useState("");
  const [cheo, setCheo] = useState("");

  const isCollege = institutionType === "college" || institutionType === "institute";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border bg-card p-6 md:p-8">
      {/* Institution Type */}
      <div className="space-y-2">
        <Label>Aina ya Taasisi *</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "secondary", label: "Sekondari", icon: School, desc: "O-Level / A-Level" },
            { value: "college", label: "College", icon: GraduationCap, desc: "Chuo" },
            { value: "institute", label: "Institute", icon: GraduationCap, desc: "Taasisi" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setInstitutionType(opt.value)}
              className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 text-center transition-all ${
                institutionType === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              <opt.icon className="h-5 w-5" />
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-xs">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* School/College Name */}
      <div className="space-y-2">
        <Label>{isCollege ? "Jina la Chuo/Institute *" : "Jina la Shule *"}</Label>
        <Input required placeholder={isCollege ? "Mfano: Dar es Salaam Institute of Technology" : "Mfano: Christon Secondary School"} />
      </div>

      {/* Owner Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Jina la Mmiliki/Msimamizi/Mwl *</Label>
          <Input required placeholder="Jina kamili" />
        </div>
        <div className="space-y-2">
          <Label>Cheo/Nafasi *</Label>
          <Select required value={cheo} onValueChange={setCheo}>
            <SelectTrigger><SelectValue placeholder="Chagua cheo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Mmiliki (Owner)</SelectItem>
              <SelectItem value="headmaster">Mkuu wa Shule (Head)</SelectItem>
              <SelectItem value="director">Mkurugenzi (Director)</SelectItem>
              <SelectItem value="admin">Msimamizi (Admin)</SelectItem>
              <SelectItem value="marketing">Meneja Masoko (Marketing)</SelectItem>
              <SelectItem value="teacher">Mwalimu (Teacher)</SelectItem>
              <SelectItem value="other">Nyingine (Other)</SelectItem>
            </SelectContent>
          </Select>
          {cheo === "other" && (
            <Input required placeholder="Andika cheo chako hapa..." className="mt-2" />
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Namba ya Simu *</Label>
          <Input required type="tel" placeholder="+255 7XX XXX XXX" />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input required type="email" placeholder="info@shule.ac.tz" />
        </div>
      </div>

      {/* School-specific: Levels */}
      {!isCollege && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Viwango vya Elimu *</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Chagua viwango" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="o-level">O-Level (Kidato 1-4)</SelectItem>
                  <SelectItem value="a-level">A-Level (Kidato 5-6)</SelectItem>
                  <SelectItem value="both">O-Level na A-Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aina ya Shule *</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Bweni / Kutwa" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boarding">Bweni (Boarding)</SelectItem>
                  <SelectItem value="Day">Kutwa (Day)</SelectItem>
                  <SelectItem value="Both">Bweni na Kutwa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Jinsia ya Wanafunzi *</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Chagua" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boys">Wavulana tu</SelectItem>
                  <SelectItem value="Girls">Wasichana tu</SelectItem>
                  <SelectItem value="Mixed">Mchanganyiko</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Idadi ya Wanafunzi *</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Chagua idadi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="under100">Chini ya 100</SelectItem>
                  <SelectItem value="100-300">100 - 300</SelectItem>
                  <SelectItem value="300-500">300 - 500</SelectItem>
                  <SelectItem value="500-1000">500 - 1,000</SelectItem>
                  <SelectItem value="over1000">Zaidi ya 1,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* College-specific */}
      {isCollege && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Programu Zinazotolewa *</Label>
            <Select required>
              <SelectTrigger><SelectValue placeholder="Chagua programu" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="certificate">Certificate</SelectItem>
                <SelectItem value="diploma">Diploma</SelectItem>
                <SelectItem value="degree">Degree</SelectItem>
                <SelectItem value="multiple">Zaidi ya moja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Idadi ya Wanafunzi *</Label>
            <Select required>
              <SelectTrigger><SelectValue placeholder="Chagua idadi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="under200">Chini ya 200</SelectItem>
                <SelectItem value="200-500">200 - 500</SelectItem>
                <SelectItem value="500-1000">500 - 1,000</SelectItem>
                <SelectItem value="over1000">Zaidi ya 1,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Common fields */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Eneo la Shule/Chuo *</Label>
          <Select required>
            <SelectTrigger><SelectValue placeholder="Chagua mkoa" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dar">Dar es Salaam</SelectItem>
              <SelectItem value="pwani">Pwani</SelectItem>
              <SelectItem value="arusha">Arusha</SelectItem>
              <SelectItem value="mwanza">Mwanza</SelectItem>
              <SelectItem value="dodoma">Dodoma</SelectItem>
              <SelectItem value="tanga">Tanga</SelectItem>
              <SelectItem value="kilimanjaro">Kilimanjaro</SelectItem>
              <SelectItem value="other">Mkoa Mwingine</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Ada ya Mwaka (TZS) *</Label>
          <Select required>
            <SelectTrigger><SelectValue placeholder="Chagua kiwango cha ada" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="under1m">Chini ya 1,000,000</SelectItem>
              <SelectItem value="1m-3m">1,000,000 - 3,000,000</SelectItem>
              <SelectItem value="3m-6m">3,000,000 - 6,000,000</SelectItem>
              <SelectItem value="6m-10m">6,000,000 - 10,000,000</SelectItem>
              <SelectItem value="over10m">Zaidi ya 10,000,000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Huduma Unayohitaji *</Label>
        <Select required>
          <SelectTrigger><SelectValue placeholder="Chagua huduma" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="listing">Kusajili shule/chuo kwenye platform</SelectItem>
            <SelectItem value="marketing">Huduma za masoko (Marketing)</SelectItem>
            <SelectItem value="both">Kusajili na Masoko</SelectItem>
            <SelectItem value="consultation">Ushauri tu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Maelezo ya Ziada</Label>
        <Textarea placeholder="Andika maelezo yoyote kuhusu shule/chuo chako na mahitaji yako..." className="min-h-[80px]" />
      </div>

      <Button type="submit" size="lg" className="w-full">
        Sajili Shule/Chuo Changu
      </Button>
    </form>
  );
}
