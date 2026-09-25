import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { BrandBadge } from "@/components/BrandMark";
import { ApiError } from "@/lib/api";
import { startSession } from "@/lib/session";
import { loginUser } from "@/services/auth";
import { useT } from "@/i18n";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Underlined field, the way the whole auth flow is styled. */
const underline =
  "h-11 w-full border-0 border-b border-[#cfcfcf] bg-transparent px-0 text-[16px] text-foreground outline-none transition focus:border-primary";

const REMEMBER_KEY = "classmate.rememberEmail";

/**
 * Parent sign-in. Two panels: the welcome side carries the brand and the route to sign-up,
 * the form side posts to `POST /users/login`.
 */
export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const navigate = useNavigate();
  const t = useT();

  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(REMEMBER_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [reveal, setReveal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrors({});

    try {
      const session = await loginUser(email.trim(), password);
      startSession(session.profile);

      try {
        if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
        else localStorage.removeItem(REMEMBER_KEY);
      } catch {
        /* private mode — the address simply is not remembered */
      }

      toast.success(t("auth.welcomeBack", { name: session.profile?.fname ?? "" }));
      onOpenChange(false);
      setPassword("");
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors({ ...(error.details ?? {}), form: error.details ? "" : error.message });
      } else {
        setErrors({ form: t("auth.failed") });
      }
    } finally {
      setBusy(false);
    }
  };

  const goToSignUp = () => {
    onOpenChange(false);
    navigate("/jisajili");
  };

  const fieldError = (key: string) =>
    errors[key] ? <p className="mt-1.5 text-[12px] font-semibold text-destructive">{errors[key]}</p> : null;

  /*
   * Rendered only while open, rather than handing Radix a permanently mounted dialog.
   * Radix keeps a closed panel in the DOM until its exit animation reports back, so a page
   * that is not painting — a background tab, a throttled renderer — never fires
   * `animationend`, and the panel would stay on screen over an unclickable
   * `body { pointer-events: none }`. Unmounting the subtree lets React run Radix's own
   * cleanup immediately instead.
   */
  if (!open) return null;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] gap-0 overflow-hidden rounded-none border-0 p-0 sm:rounded-none">
        <DialogTitle className="sr-only">{t("auth.login")}</DialogTitle>
        <DialogDescription className="sr-only">{t("auth.welcomeBody")}</DialogDescription>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label={t("auth.close")}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid max-h-[90vh] overflow-y-auto md:grid-cols-2">
          {/* Welcome side */}
          <aside className="hidden flex-col justify-between bg-[#f1f1f1] p-10 md:flex">
            <p className="text-[19px] text-foreground">{t("auth.welcome")}</p>

            <div className="flex flex-col items-center gap-5 py-10">
              <BrandBadge className="h-[86px] w-[86px]" />
              <p className="max-w-[260px] text-center text-[14px] leading-[1.6] text-muted-foreground">
                {t("auth.welcomeBody")}
              </p>
            </div>

            <p className="text-center text-[15px] text-foreground">
              {t("auth.notMember")}{" "}
              <button type="button" onClick={goToSignUp} className="font-bold text-foreground underline underline-offset-4 hover:text-primary">
                {t("auth.signUp")}
              </button>
            </p>
          </aside>

          {/* Form side */}
          <form onSubmit={submit} className="bg-card p-8 sm:p-12">
            <h2 className="text-[28px] font-bold text-foreground">{t("auth.login")}</h2>

            <div className="mt-10 space-y-8">
              <div>
                <label htmlFor="login-email" className="text-[14px] text-foreground">
                  <span className="text-primary">*</span>
                  {t("auth.emailLabel")}
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors({});
                  }}
                  className={`${underline} mt-3`}
                />
                {fieldError("email")}
              </div>

              <div>
                <label htmlFor="login-password" className="text-[14px] text-foreground">
                  <span className="text-primary">*</span>
                  {t("auth.passwordLabel")}
                </label>
                <div className="relative mt-3">
                  <input
                    id="login-password"
                    type={reveal ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors({});
                    }}
                    className={`${underline} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((value) => !value)}
                    aria-label={reveal ? t("auth.hidePassword") : t("auth.showPassword")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-foreground/70 transition hover:text-foreground"
                  >
                    {reveal ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldError("password")}
              </div>
            </div>

            <label className="mt-7 flex cursor-pointer items-center gap-2.5 text-[15px] text-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              {t("auth.rememberMe")}
            </label>

            {errors.form && (
              <p className="mt-5 rounded-lg bg-destructive/10 px-3 py-2.5 text-[13px] font-semibold text-destructive">{errors.form}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-7 flex h-[58px] w-full items-center justify-center gap-2 bg-secondary text-[16px] font-semibold text-secondary-foreground transition hover:bg-secondary/90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("auth.loginNow")}
            </button>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => toast.info(t("auth.forgotHelp"))}
                className="text-[15px] text-foreground underline underline-offset-4 hover:text-primary"
              >
                {t("auth.forgotPassword")}
              </button>
            </div>

            <p className="mt-10 text-[15px] font-bold text-foreground">{t("auth.orSignInWith")}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {["Google", "Facebook"].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => toast.info(t("auth.socialSoon", { provider }))}
                  className="flex h-[58px] items-center justify-center gap-2.5 border border-[#3b6fd4]/60 text-[16px] text-foreground transition hover:bg-muted"
                >
                  <span aria-hidden="true" className="text-[18px] font-bold">
                    {provider === "Google" ? "G" : "f"}
                  </span>
                  {provider}
                </button>
              ))}
            </div>

            <p className="mt-8 text-center text-[15px] text-foreground md:hidden">
              {t("auth.notMember")}{" "}
              <button type="button" onClick={goToSignUp} className="font-bold underline underline-offset-4">
                {t("auth.signUp")}
              </button>
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
