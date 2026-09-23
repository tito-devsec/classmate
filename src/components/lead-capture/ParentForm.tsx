import { useState } from "react";
import { GraduationCap, Loader2, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api";
import { submitApplication } from "@/services/applications";

interface ParentFormProps {
  onSubmit: (isCollege: boolean) => void;
  initialCategory?: string;
  /** Set when the parent opened the form from a school profile. */
  schoolId?: string;
}

const REGIONS = [
  "Dar es Salaam", "Pwani", "Arusha", "Kilimanjaro", "Tanga", "Mwanza", "Dodoma", "Morogoro",
  "Mbeya", "Iringa", "Kagera", "Tabora", "Kigoma", "Shinyanga", "Simiyu", "Geita", "Mara",
  "Singida", "Rukwa", "Katavi", "Njombe", "Ruvuma", "Lindi", "Mtwara", "Songwe", "Zanzibar",
];

const KIDATO = [
  { value: "form1", label: "Kidato cha 1", level: "O-Level", api: "FORM_ONE" },
  { value: "form2", label: "Kidato cha 2", level: "O-Level", api: "FORM_TWO" },
  { value: "form3", label: "Kidato cha 3", level: "O-Level", api: "FORM_THREE" },
  { value: "form4", label: "Kidato cha 4", level: "O-Level", api: "FORM_FOUR" },
  { value: "form5", label: "Kidato cha 5", level: "A-Level", api: "FORM_FIVE" },
  { value: "form6", label: "Kidato cha 6", level: "A-Level", api: "FORM_SIX" },
];

/** Budget band → the single figure the API stores in `targetBudget`. */
const SCHOOL_BUDGETS = [
  { value: "under2m", label: "Chini ya 2,000,000", amount: "2000000" },
  { value: "2m-4m", label: "2,000,000 - 4,000,000", amount: "4000000" },
  { value: "4m-6m", label: "4,000,000 - 6,000,000", amount: "6000000" },
  { value: "over6m", label: "Zaidi ya 6,000,000", amount: "8000000" },
];

const COLLEGE_BUDGETS = [
  { value: "under2m", label: "Chini ya 2,000,000", amount: "2000000" },
  { value: "2m-5m", label: "2,000,000 - 5,000,000", amount: "5000000" },
  { value: "5m-10m", label: "5,000,000 - 10,000,000", amount: "10000000" },
  { value: "over10m", label: "Zaidi ya 10,000,000", amount: "15000000" },
];

const EDUCATION_LEVELS = [
  { value: "form4", label: "Kidato cha 4 (CSEE)" },
  { value: "form6", label: "Kidato cha 6 (ACSEE)" },
  { value: "diploma", label: "Diploma" },
  { value: "degree", label: "Shahada ya Kwanza" },
];

const COURSES = [
  { value: "medicine", label: "Medicine / Health Sciences" },
  { value: "engineering", label: "Engineering / Technology" },
  { value: "business", label: "Business / Finance" },
  { value: "law", label: "Law" },
  { value: "education", label: "Education" },
  { value: "it", label: "IT / Computer Science" },
  { value: "arts", label: "Arts / Social Sciences" },
  { value: "agriculture", label: "Agriculture" },
  { value: "other", label: "Nyingine" },
];

const STUDY_LEVELS = [
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "degree", label: "Shahada (Degree)" },
  { value: "masters", label: "Masters" },
];

const BOARDING = [
  { value: "Boarding", label: "Bweni (Boarding)", api: 1 },
  { value: "Day", label: "Kutwa (Day)", api: 0 },
  { value: "Both", label: "Yoyote", api: 2 },
];

const RELIGIONS = [
  { value: "any", label: "Yoyote" },
  { value: "islam", label: "Kiislamu" },
  { value: "christian", label: "Kikristo" },
];

const YEARS = ["2026", "2027", "2028"];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  kidato: "",
  boarding: "",
  budget: "",
  gender: "",
  studentRegion: "",
  schoolRegion: "",
  religion: "",
  year: "",
  educationLevel: "",
  collegeType: "",
  course: "",
  studyLevel: "",
  notes: "",
};

export function ParentForm({ onSubmit, initialCategory, schoolId }: ParentFormProps) {
  const [category, setCategory] = useState(initialCategory || "");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isCollege = category === "College";
  const set = (key: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    set("kidato", "");
  };

  /** Picking a form also decides whether this is an O-Level or A-Level enquiry. */
  const handleKidatoChange = (value: string) => {
    set("kidato", value);
    const match = KIDATO.find((entry) => entry.value === value);
    if (match) setCategory(match.level);
  };

  const kidatoOptions = KIDATO.filter((entry) => !category || category === "College" || entry.level === category);
  const budgets = isCollege ? COLLEGE_BUDGETS : SCHOOL_BUDGETS;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErrors({});

    const kidato = KIDATO.find((entry) => entry.value === form.kidato);
    const boarding = BOARDING.find((entry) => entry.value === form.boarding);
    const budget = budgets.find((entry) => entry.value === form.budget);

    try {
      const result = await submitApplication({
        parentName: form.name,
        phone: form.phone,
        email: form.email || undefined,
        applicationLevel: isCollege ? "COLLEGE" : (kidato?.api ?? "FORM_ONE"),
        isBoarding: boarding?.api ?? 0,
        studentGender: form.gender === "Boys" ? "MALE" : form.gender === "Girls" ? "FEMALE" : undefined,
        targetBudget: budget?.amount,
        studentLocation: form.studentRegion || undefined,
        schoolLocation: form.schoolRegion || undefined,
        religion: RELIGIONS.find((entry) => entry.value === form.religion)?.label,
        beginYear: form.year ? Number(form.year) : undefined,
        currentEducationLevel: EDUCATION_LEVELS.find((entry) => entry.value === form.educationLevel)?.label,
        collegeType: form.collegeType || undefined,
        course: [
          COURSES.find((entry) => entry.value === form.course)?.label,
          STUDY_LEVELS.find((entry) => entry.value === form.studyLevel)?.label,
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
        comment: form.notes || undefined,
        schID: schoolId ?? null,
      });

      console.log("[Classmate Track] application_submitted", {
        queued: result.queued,
        type: isCollege ? "college" : "school",
      });
      onSubmit(isCollege);
    } catch (error) {
      if (error instanceof ApiError && error.details) {
        // Map the API's field names back onto the inputs.
        const mapped: Record<string, string> = {};
        for (const [field, message] of Object.entries(error.details)) {
          if (field === "parentName") mapped.name = message;
          else if (field === "applicationLevel") mapped.kidato = message;
          else mapped[field] = message;
        }
        setErrors(mapped);
      } else {
        setErrors({ form: error instanceof Error ? error.message : "Imeshindikana kutuma. Jaribu tena." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? <p className="text-[12px] font-medium text-destructive">{errors[key]}</p> : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-card p-6 shadow-sm md:p-8">
      {/* Category */}
      <div className="space-y-2">
        <Label>Aina ya maombi *</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "O-Level", label: "O-Level", icon: School },
            { value: "A-Level", label: "A-Level", icon: School },
            { value: "College", label: "Chuo", icon: GraduationCap },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleCategoryChange(option.value)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-center transition-all ${
                category === option.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50"
              }`}
            >
              <option.icon className="h-5 w-5" />
              <span className="whitespace-nowrap text-xs font-semibold sm:text-sm">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Name & phone */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{isCollege ? "Jina kamili *" : "Jina la mzazi *"}</Label>
          <Input
            required
            value={form.name}
            onChange={(event) => set("name", event.target.value)}
            placeholder={isCollege ? "Jina lako kamili" : "Jina la mzazi/mlezi"}
          />
          {fieldError("name")}
        </div>
        <div className="space-y-2">
          <Label>Namba ya simu *</Label>
          <Input
            required
            type="tel"
            value={form.phone}
            onChange={(event) => set("phone", event.target.value)}
            placeholder="+255 7XX XXX XXX"
          />
          {fieldError("phone")}
        </div>
      </div>

      {/* School branch */}
      {!isCollege && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Kidato cha mwanafunzi *</Label>
              <Select value={form.kidato} onValueChange={handleKidatoChange} required>
                <SelectTrigger><SelectValue placeholder="Chagua kidato" /></SelectTrigger>
                <SelectContent>
                  {kidatoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldError("kidato")}
            </div>
            <div className="space-y-2">
              <Label>Aina ya shule *</Label>
              <Select value={form.boarding} onValueChange={(value) => set("boarding", value)} required>
                <SelectTrigger><SelectValue placeholder="Bweni / Kutwa" /></SelectTrigger>
                <SelectContent>
                  {BOARDING.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Bajeti ya mwaka (TZS) *</Label>
              <Select value={form.budget} onValueChange={(value) => set("budget", value)} required>
                <SelectTrigger><SelectValue placeholder="Chagua bajeti" /></SelectTrigger>
                <SelectContent>
                  {budgets.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Jinsia ya mwanafunzi</Label>
              <Select value={form.gender} onValueChange={(value) => set("gender", value)}>
                <SelectTrigger><SelectValue placeholder="Chagua jinsia" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boys">Mvulana</SelectItem>
                  <SelectItem value="Girls">Msichana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Mwanafunzi anatokea wapi? *</Label>
              <Select value={form.studentRegion} onValueChange={(value) => set("studentRegion", value)} required>
                <SelectTrigger><SelectValue placeholder="Mkoa anaotokea" /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mkoa wa shule anayoitaka</Label>
              <Select value={form.schoolRegion} onValueChange={(value) => set("schoolRegion", value)}>
                <SelectTrigger><SelectValue placeholder="Chagua mkoa (si lazima)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Popote Tanzania">Popote Tanzania</SelectItem>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dini (si lazima)</Label>
            <Select value={form.religion} onValueChange={(value) => set("religion", value)}>
              <SelectTrigger><SelectValue placeholder="Chagua dini" /></SelectTrigger>
              <SelectContent>
                {RELIGIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* College branch */}
      {isCollege && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Barua pepe *</Label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                placeholder="email@example.com"
              />
              {fieldError("email")}
            </div>
            <div className="space-y-2">
              <Label>Elimu uliyonayo sasa *</Label>
              <Select value={form.educationLevel} onValueChange={(value) => set("educationLevel", value)} required>
                <SelectTrigger><SelectValue placeholder="Chagua kiwango" /></SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Aina ya chuo *</Label>
            <Select value={form.collegeType} onValueChange={(value) => set("collegeType", value)} required>
              <SelectTrigger><SelectValue placeholder="Chagua aina" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Institute">Taasisi (Institute)</SelectItem>
                <SelectItem value="College">Chuo (College)</SelectItem>
                <SelectItem value="Yoyote">Yoyote</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Fani unayopenda *</Label>
              <Select value={form.course} onValueChange={(value) => set("course", value)} required>
                <SelectTrigger><SelectValue placeholder="Chagua fani" /></SelectTrigger>
                <SelectContent>
                  {COURSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kiwango cha masomo *</Label>
              <Select value={form.studyLevel} onValueChange={(value) => set("studyLevel", value)} required>
                <SelectTrigger><SelectValue placeholder="Chagua kiwango" /></SelectTrigger>
                <SelectContent>
                  {STUDY_LEVELS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Unatokea mkoa gani? *</Label>
              <Select value={form.studentRegion} onValueChange={(value) => set("studentRegion", value)} required>
                <SelectTrigger><SelectValue placeholder="Mkoa unaotokea" /></SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mkoa wa chuo unachokitaka</Label>
              <Select value={form.schoolRegion} onValueChange={(value) => set("schoolRegion", value)}>
                <SelectTrigger><SelectValue placeholder="Chagua mkoa (si lazima)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Popote Tanzania">Popote Tanzania</SelectItem>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bajeti ya mwaka (TZS) *</Label>
            <Select value={form.budget} onValueChange={(value) => set("budget", value)} required>
              <SelectTrigger><SelectValue placeholder="Chagua bajeti" /></SelectTrigger>
              <SelectContent>
                {budgets.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Maelezo ya ziada</Label>
            <Textarea
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
              placeholder="Andika maelezo yoyote ya ziada kuhusu upendeleo wako wa chuo…"
              className="min-h-[80px]"
            />
          </div>
        </>
      )}

      {/* Start year */}
      <div className="space-y-2">
        <Label>Mwaka wa kuanza *</Label>
        <Select value={form.year} onValueChange={(value) => set("year", value)} required>
          <SelectTrigger><SelectValue placeholder="Chagua mwaka" /></SelectTrigger>
          <SelectContent>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {errors.form && (
        <p className="rounded-xl bg-destructive/10 p-3 text-[13px] font-medium text-destructive">{errors.form}</p>
      )}

      <Button type="submit" size="lg" className="w-full rounded-full" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isCollege ? "Tuma maombi ya chuo" : "Tuma maombi"}
      </Button>

      <p className="text-center text-[12px] text-muted-foreground">
        Kwa kutuma unakubali tuwasiliane nawe kuhusu shule zinazokufaa. Hatushiriki taarifa zako
        na mtu yeyote asiyehusika.
      </p>
    </form>
  );
}
