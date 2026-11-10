import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PrimaryButton } from "./Buttons";
import { useTranslation } from "react-i18next";
import { serverErrorKey } from "@/lib/formErrors";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9 ().-]{5,19}$/;
const fieldCls = "h-12 rounded-xl border-ic-cyan2/15 bg-ic-bg/60 text-ic-white placeholder:text-ic-grey/50 focus-visible:ring-1 focus-visible:ring-ic-cyan2 focus-visible:border-ic-cyan2/60 transition-[border-color,box-shadow]";
const EMPTY = { nome_cognome: "", telefono: "", email: "", privacy: false, website: "" };

function validate(v) {
  const e = {};
  if (v.nome_cognome.trim().length < 3) e.nome_cognome = "nomeCognome";
  const tel = v.telefono.trim();
  if (!PHONE_RE.test(tel) || tel.replace(/\D/g, "").length < 6) e.telefono = "telefono";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "email";
  if (!v.privacy) e.privacy = "privacy";
  return e;
}

const Field = ({ id, label, error, children }) => {
  const { t } = useTranslation();
  return (
  <div className="flex flex-col gap-2">
    <Label htmlFor={id} className="text-[13px] font-medium text-ic-white/90">{label} <span className="text-ic-cyan2">*</span></Label>
    {children}
    {error && <p className="text-xs text-red-300" role="alert" data-testid={`${id}-error`}>{t(`form.errors.${error}`)}</p>}
  </div>
  );
};

export const CallbackForm = ({ onSuccess }) => {
  const [v, setV] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMsg, setServerMsg] = useState("");
  const { t } = useTranslation();
  const startedAt = useRef(Date.now());
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus("sending");
    try {
      const { data } = await axios.post(`${API}/callback`, { ...v, started_at: startedAt.current });
      if (data?.status !== "accepted") throw new Error("not accepted");
      setStatus("success");
      onSuccess?.();
      toast.success(t("form.toastOk"), { description: t("form.callbackToast") });
    } catch (err) {
      const key = serverErrorKey(err);
      setServerMsg(key);
      setStatus("error");
      toast.error(t("form.toastErr"), { description: t(`form.server.${key}`) });
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-5 py-8" role="status" data-testid="callback-success">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ic-cyan2/40 bg-ic-cyan/10 shadow-[0_0_40px_-8px_rgba(0,207,255,0.7)]">
          <CheckCircle2 className="h-7 w-7 text-ic-cyan2" aria-hidden />
        </div>
        <h2 className="font-display text-2xl font-semibold text-ic-white">{t("form.successTitle")}</h2>
        <p className="max-w-md text-ic-grey">{t("form.callbackSuccess", { name: v.nome_cognome })}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5" data-testid="callback-form">
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="callback-website">{t("form.honeypot")}</label>
        <input id="callback-website" tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
      </div>
      <Field id="callback-nome" label={t("form.nomeCognome")} error={errors.nome_cognome}>
        <Input id="callback-nome" autoComplete="name" value={v.nome_cognome} onChange={set("nome_cognome")} className={fieldCls} aria-invalid={!!errors.nome_cognome} data-testid="callback-nome-input" />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field id="callback-telefono" label={t("form.telefono")} error={errors.telefono}>
          <Input id="callback-telefono" type="tel" inputMode="tel" autoComplete="tel" value={v.telefono} onChange={set("telefono")} className={fieldCls} aria-invalid={!!errors.telefono} data-testid="callback-telefono-input" />
        </Field>
        <Field id="callback-email" label={t("form.emailFull")} error={errors.email}>
          <Input id="callback-email" type="email" autoComplete="email" value={v.email} onChange={set("email")} className={fieldCls} aria-invalid={!!errors.email} data-testid="callback-email-input" />
        </Field>
      </div>
      <div>
        <div className="flex items-start gap-3">
          <Checkbox id="callback-privacy" checked={v.privacy} onCheckedChange={(c) => setV((s) => ({ ...s, privacy: c === true }))} className="mt-0.5 border-ic-cyan2/50 data-[state=checked]:bg-ic-cyan data-[state=checked]:text-ic-bg" aria-invalid={!!errors.privacy} data-testid="callback-privacy-checkbox" />
          <Label htmlFor="callback-privacy" className="text-[13px] font-normal leading-relaxed text-ic-grey">
            {t("form.privacyA")}<Link to="/privacy" target="_blank" className="text-ic-cyan2 underline underline-offset-2">{t("form.privacyLink")}</Link>. <span className="text-ic-cyan2">*</span>
          </Label>
        </div>
        {errors.privacy && <p className="mt-2 pl-7 text-xs text-red-300" role="alert" data-testid="callback-privacy-error">{t(`form.errors.${errors.privacy}`)}</p>}
      </div>
      {status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert" data-testid="callback-error-message">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{t(`form.server.${serverMsg}`)}
        </div>
      )}
      <div className="flex flex-col-reverse items-start gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-ic-grey/60">{t("common.required")}</span>
        <PrimaryButton type="submit" disabled={status === "sending"} icon={status !== "sending"} className="w-full sm:w-auto" data-testid="callback-submit-button">
          {status === "sending" ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{t("form.sending")}</>) : t("form.callbackSubmit")}
        </PrimaryButton>
      </div>
    </form>
  );
};
