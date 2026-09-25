import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AuthDialog } from "@/components/AuthDialog";
import { ApiError } from "@/lib/api";
import { startSession } from "@/lib/session";
import { registerUser } from "@/services/auth";
import { useRegions } from "@/hooks/useSchools";
import { useT } from "@/i18n";

const underline =
  "h-11 w-full border-0 border-b border-[#cfcfcf] bg-transparent px-0 text-[16px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary";

const select =
  "h-[52px] w-full appearance-none rounded-lg border border-[#cfcfcf] bg-card pl-4 pr-10 text-[16px] text-foreground outline-none transition focus:border-primary";

const GRADES = [1, 2, 3, 4, 5, 6];
const YEARS = [2026, 2027, 2028];

/** Two small numbers the visitor adds up — enough to stop naive form bots. */
const newChallenge = () => ({
  a: Math.floor(Math.random() * 20) + 5,
  b: Math.floor(Math.random() * 9) + 1,
});

/** Draws the challenge as wobbled digits on a noisy strip, generated fresh each time. */
function CaptchaImage({ a, b }: { a: number; b: number }) {
  const text = `${a} + ${b} =`;
  return (
    <svg viewBox="0 0 120 40" className="h-[40px] w-[120px] rounded bg-[#e4e4e4]" role="img" aria-label={text}>
      <g stroke="#9a9a9a" strokeWidth="1">
        <path d="M4 28 C30 14, 70 34, 116 16" fill="none" />
        <path d="M6 14 C40 30, 80 8, 114 26" fill="none" />
      </g>
      {text.split("").map((character, index) => (
        <text
          key={index}
          x={8 + index * 15}
          y={27 + (index % 2 === 0 ? 2 : -2)}
          fontSize="19"
          fontWeight="700"
          fill="#2b2b2b"
          fontFamily="Segoe UI, Open Sans, sans-serif"
          transform={`rotate(${index % 2 === 0 ? -8 : 7} ${8 + index * 15} 24)`}
        >
          {character}
        </text>
      ))}
    </svg>
  );
}

const emptyForm = {
  fname: "",
  lname: "",
  email: "",
  phone: "",
  password: "",
  confirm: "",
  region: "",
  role: "parent",
  gender: "",
  grade: "",
  year: "",
  captcha: "",
};

/**
 * Parent / student registration against `POST /users/register`. The profile answers below
 * the credentials travel with the request so the team can shortlist schools straight away;
 * a backend that ignores the extra fields still creates the account.
 */
const SignUp = () => {
  const navigate = useNavigate();
  const t = useT();
  const { data: regions = [] } = useRegions();

  const [form, setForm] = useState(emptyForm);
  const [challenge, setChallenge] = useState(newChallenge);
  const [reveal, setReveal] = useState(false);
  const [revealConfirm, setRevealConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [contactable, setContactable] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const set = (key: keyof typeof emptyForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "", form: "" }));
  };

  const gradeLabels = useMemo(() => GRADES.map((n) => ({ value: String(n), label: t("lead.formN", { n }) })), [t]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;

    const found: Record<string, string> = {};
    if (form.password.length < 8) found.password = t("signup.passwordShort");
    if (form.password !== form.confirm) found.confirm = t("signup.passwordMismatch");
    if (Number(form.captcha) !== challenge.a + challenge.b) found.captcha = t("signup.captchaWrong");
    if (!acceptedTerms) found.terms = t("signup.mustAcceptTerms");

    if (Object.keys(found).length > 0) {
      setErrors(found);
      if (found.captcha) setChallenge(newChallenge());
      return;
    }

    setBusy(true);
    setErrors({});

    try {
      const session = await registerUser({
        fname: form.fname.trim(),
        lname: form.lname.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        // Profile answers — carried through for the advisory team.
        region: form.region || undefined,
        role: form.role,
        studentGender: form.gender ? (form.gender === "female" ? "FEMALE" : "MALE") : undefined,
        applicationLevel: form.grade ? `FORM_${form.grade}` : undefined,
        beginYear: form.year ? Number(form.year) : undefined,
        contactable,
      });

      startSession(session.profile);
      toast.success(t("auth.accountCreated"));
      navigate("/");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ ...(error.details ?? {}), form: error.details ? "" : error.message });
      } else {
        setErrors({ form: t("auth.failed") });
      }
      setChallenge(newChallenge());
      setForm((current) => ({ ...current, captcha: "" }));
    } finally {
      setBusy(false);
    }
  };

  const label = (text: string, required = false) => (
    <span className="text-[14px] text-foreground">
      {required && <span className="text-primary">*</span>}
      {text}
    </span>
  );

  const fieldError = (key: string) =>
    errors[key] ? <p className="mt-1.5 text-[12px] font-semibold text-destructive">{errors[key]}</p> : null;

  const radio = (name: string, value: string, current: string, onPick: (value: string) => void, text: string) => (
    <label className="flex cursor-pointer items-center gap-2.5 text-[16px] text-foreground">
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={() => onPick(value)}
        className="h-4 w-4 accent-primary"
      />
      {text}
    </label>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Jisajili — Classmate"
        description="Fungua akaunti ya bure ya Classmate ili kufuatilia maombi yako, kuhifadhi shule unazopenda na kupata mapendekezo ya shule Tanzania."
        path="/jisajili"
      />
      <Navbar />

      <nav aria-label="Breadcrumb" className="wrap flex items-center gap-1.5 py-5 text-[13px] text-foreground">
        <Link to="/" className="hover:text-primary">{t("nav.home")}</Link>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{t("signup.title")}</span>
      </nav>

      <header className="wrap pb-10 text-center">
        <h1 className="display-xl text-foreground">{t("signup.title")}</h1>
        <p className="mt-5 text-[16px] text-foreground">{t("signup.subtitle")}</p>
      </header>

      <section className="wrap pb-20">
        <form onSubmit={submit} className="mx-auto max-w-[960px] rounded-2xl bg-card p-6 shadow-[0_2px_10px_rgba(0,0,0,0.08)] sm:p-12">
          <h2 className="text-[24px] font-bold text-foreground">{t("signup.withEmail")}</h2>

          {/* Credentials */}
          <div className="mt-10 space-y-9">
            <div>
              {label(t("auth.emailLabel"), true)}
              <input
                type="email"
                required
                autoComplete="email"
                placeholder={t("auth.emailLabel")}
                value={form.email}
                onChange={(event) => set("email", event.target.value)}
                className={`${underline} mt-3`}
              />
              {fieldError("email")}
            </div>

            <div className="grid gap-9 md:grid-cols-2">
              <div>
                {label(t("auth.passwordLabel"), true)}
                <div className="relative mt-3">
                  <input
                    type={reveal ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder={t("auth.passwordLabel")}
                    value={form.password}
                    onChange={(event) => set("password", event.target.value)}
                    className={`${underline} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((value) => !value)}
                    aria-label={reveal ? t("auth.hidePassword") : t("auth.showPassword")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-foreground/70 hover:text-foreground"
                  >
                    {reveal ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldError("password")}
              </div>

              <div>
                {label(t("signup.confirmPassword"), true)}
                <div className="relative mt-3">
                  <input
                    type={revealConfirm ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder={t("signup.confirmPassword")}
                    value={form.confirm}
                    onChange={(event) => set("confirm", event.target.value)}
                    className={`${underline} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setRevealConfirm((value) => !value)}
                    aria-label={revealConfirm ? t("auth.hidePassword") : t("auth.showPassword")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-foreground/70 hover:text-foreground"
                  >
                    {revealConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldError("confirm")}
              </div>
            </div>

            {/* Who you are */}
            <div className="grid gap-9 md:grid-cols-2">
              <div>
                {label(t("signup.firstName"), true)}
                <input
                  required
                  autoComplete="given-name"
                  placeholder={t("signup.firstName")}
                  value={form.fname}
                  onChange={(event) => set("fname", event.target.value)}
                  className={`${underline} mt-3`}
                />
                {fieldError("fname")}
              </div>
              <div>
                {label(t("signup.lastName"), true)}
                <input
                  required
                  autoComplete="family-name"
                  placeholder={t("signup.lastName")}
                  value={form.lname}
                  onChange={(event) => set("lname", event.target.value)}
                  className={`${underline} mt-3`}
                />
                {fieldError("lname")}
              </div>
            </div>

            <div className="md:max-w-[50%] md:pr-[18px]">
              {label(t("signup.phone"), true)}
              <input
                type="tel"
                required
                autoComplete="tel"
                placeholder={t("signup.phonePlaceholder")}
                value={form.phone}
                onChange={(event) => set("phone", event.target.value)}
                className={`${underline} mt-3`}
              />
              {fieldError("phone")}
            </div>
          </div>

          {/* Location */}
          <div className="mt-9">
            {label(t("signup.location"), true)}
            <div className="relative mt-3 max-w-[430px]">
              <select
                required
                value={form.region}
                onChange={(event) => set("region", event.target.value)}
                className={select}
              >
                <option value="">{t("signup.selectRegion")}</option>
                {regions.map((entry) => (
                  <option key={entry.name} value={entry.name}>
                    {entry.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
            </div>
          </div>

          {/* Role */}
          <fieldset className="mt-9">
            <legend className="text-[14px] text-primary">{t("signup.iAmA")}</legend>
            <div className="mt-3 flex flex-wrap gap-8">
              {radio("role", "parent", form.role, (value) => set("role", value), t("signup.parent"))}
              {radio("role", "consultant", form.role, (value) => set("role", value), t("signup.consultant"))}
            </div>
          </fieldset>

          {/* Student gender */}
          <fieldset className="mt-9">
            <legend className="text-[14px] text-primary">{t("signup.studentGender")}</legend>
            <div className="mt-3 flex flex-wrap gap-8">
              {radio("gender", "female", form.gender, (value) => set("gender", value), t("signup.female"))}
              {radio("gender", "male", form.gender, (value) => set("gender", value), t("signup.male"))}
            </div>
          </fieldset>

          {/* Study plans */}
          <div className="mt-9 grid gap-9 md:grid-cols-2">
            <div>
              {label(t("signup.gradeToApply"))}
              <div className="relative mt-3">
                <select value={form.grade} onChange={(event) => set("grade", event.target.value)} className={select}>
                  <option value="">{t("signup.selectGrade")}</option>
                  {gradeLabels.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
              </div>
            </div>

            <div>
              {label(t("signup.yearToApply"))}
              <div className="relative mt-3">
                <select value={form.year} onChange={(event) => set("year", event.target.value)} className={select}>
                  <option value="">{t("signup.selectYear")}</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
              </div>
            </div>
          </div>

          {/* Captcha */}
          <div className="mt-10">
            {label(` ${t("signup.captcha")}`, true)}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <CaptchaImage a={challenge.a} b={challenge.b} />
              <button
                type="button"
                onClick={() => {
                  setChallenge(newChallenge());
                  set("captcha", "");
                }}
                aria-label={t("signup.captchaRefresh")}
                className="text-foreground transition hover:text-primary"
              >
                <RefreshCw className="h-[18px] w-[18px]" />
              </button>
              <input
                required
                inputMode="numeric"
                placeholder={t("signup.captchaPlaceholder")}
                value={form.captcha}
                onChange={(event) => set("captcha", event.target.value)}
                className={`${underline} max-w-[280px] flex-1`}
              />
            </div>
            {fieldError("captcha")}
          </div>

          <p className="mt-8 text-[13px] text-primary">{t("signup.required")}</p>

          <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[16px] text-foreground">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked);
                setErrors((current) => ({ ...current, terms: "" }));
              }}
              className="mt-1 h-4 w-4 accent-primary"
            />
            {t("signup.terms")}
          </label>
          {fieldError("terms")}

          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[16px] text-foreground">
            <input
              type="checkbox"
              checked={contactable}
              onChange={(event) => setContactable(event.target.checked)}
              className="mt-1 h-4 w-4 accent-primary"
            />
            {t("signup.contactMe")}
          </label>

          {errors.form && (
            <p className="mt-6 rounded-lg bg-destructive/10 px-3 py-2.5 text-[13px] font-semibold text-destructive">{errors.form}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-8 flex h-[62px] w-full items-center justify-center gap-2 bg-secondary text-[17px] font-semibold text-secondary-foreground transition hover:bg-secondary/90 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("signup.createAccount")}
          </button>

          <p className="mt-6 text-center text-[15px] text-foreground">
            {t("signup.haveAccount")}{" "}
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="font-bold underline underline-offset-4 hover:text-primary"
            >
              {t("auth.login")}
            </button>
          </p>
        </form>
      </section>

      <AuthDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <Footer />
    </div>
  );
};

export default SignUp;
