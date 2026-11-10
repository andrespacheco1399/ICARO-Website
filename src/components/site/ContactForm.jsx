import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PrimaryButton } from "./Buttons";
import { useTranslation } from "react-i18next";
import { serverErrorKey } from "@/lib/formErrors";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const fieldCls = "h-12 rounded-xl border-ic-cyan2/15 bg-ic-bg/60 text-ic-white placeholder:text-ic-grey/50 focus-visible:ring-1 focus-visible:ring-ic-cyan2 focus-visible:border-ic-cyan2/60 transition-[border-color,box-shadow]";

const empty = (tipologia) => ({ nome: "", cognome: "", email: "", azienda: "", tipologia, messaggio: "", privacy: false, marketing: false, website: "" });

function validate(v) {
  const e = {};
  if (!v.nome.trim()) e.nome = "nome";
  if (!v.cognome.trim()) e.cognome = "cognome";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "email";
  if (!v.tipologia) e.tipologia = "tipologia";
  if (v.messaggio.trim().length < 10) e.messaggio = "messaggio";
  if (!v.privacy) e.privacy = "privacy";
  return e;
}

const Field = ({ id, label, error, optional, children }) => {
  const { t } = useTranslation();
  return (
  <div className="flex flex-col gap-2">
    <Label htmlFor={id} className="text-[13px] font-medium text-ic-white/90">
      {label} {optional && <span className="font-normal text-ic-grey/60">{t("common.optional")}</span>}
    </Label>
    {children}
    {error && <p className="text-xs text-red-300" role="alert" data-testid={`${id}-error`}>{t(`form.errors.${error}`)}</p>}
  </div>
  );
};

export const ContactForm = ({ origine = "home", defaultTipologia = "", idPrefix = "contact" }) => {
  const [v, setV] = useState(() => empty(defaultTipologia));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverMsg, setServerMsg] = useState("");
  const { t } = useTranslation();
  const startedAt = useRef(Date.now());
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));
  const id = (k) => `${idPrefix}-${k}`;

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(v);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus("sending");
    setServerMsg("");
    try {
      const { data } = await axios.post(`${API}/contact`, {
        ...v, azienda: v.azienda.trim() || null, origine, started_at: startedAt.current,
      });
      if (data?.status !== "accepted") throw new Error("not accepted");
      setStatus("success");
      toast.success(t("form.toastOk"), { description: t("form.toastOkDesc") });
    } catch (err) {
      const key = serverErrorKey(err);
      setServerMsg(key);
      setStatus("error");
      toast.error(t("form.toastErr"), { description: t(`form.server.${key}`) });
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-5 py-10" data-testid={`${idPrefix}-success`} role="status">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-ic-cyan2/40 bg-ic-cyan/10 shadow-[0_0_40px_-8px_rgba(0,207,255,0.7)]">
          <CheckCircle2 className="h-7 w-7 text-ic-cyan2" aria-hidden />
        </div>
        <h3 className="font-display text-2xl font-semibold text-ic-white">{t("form.successTitle")}</h3>
        <p className="max-w-md text-ic-grey">{t("form.successText", { name: v.nome, email: v.email })}</p>
        <button
          onClick={() => { setV(empty(defaultTipologia)); setErrors({}); startedAt.current = Date.now(); setStatus("idle"); }}
          className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-ic-cyan2 underline-offset-4 hover:underline"
          data-testid={`${idPrefix}-new-request`}
        >
          {t("form.another")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5" data-testid={`${idPrefix}-form`}>
      {/* honeypot (anti-spam) */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor={id("website")}>{t("form.honeypot")}</label>
        <input id={id("website")} tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("nome")} label={t("form.nome")} error={errors.nome}>
          <Input id={id("nome")} autoComplete="given-name" value={v.nome} onChange={set("nome")} className={fieldCls} aria-invalid={!!errors.nome} data-testid={`${idPrefix}-nome-input`} />
        </Field>
        <Field id={id("cognome")} label={t("form.cognome")} error={errors.cognome}>
          <Input id={id("cognome")} autoComplete="family-name" value={v.cognome} onChange={set("cognome")} className={fieldCls} aria-invalid={!!errors.cognome} data-testid={`${idPrefix}-cognome-input`} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={id("email")} label={t("form.email")} error={errors.email}>
          <Input id={id("email")} type="email" autoComplete="email" value={v.email} onChange={set("email")} className={fieldCls} aria-invalid={!!errors.email} data-testid={`${idPrefix}-email-input`} />
        </Field>
        <Field id={id("azienda")} label={t("form.azienda")} optional>
          <Input id={id("azienda")} autoComplete="organization" value={v.azienda} onChange={set("azienda")} className={fieldCls} data-testid={`${idPrefix}-azienda-input`} />
        </Field>
      </div>
      <Field id={id("tipologia")} label={t("form.tipologia")} error={errors.tipologia}>
        <Select value={v.tipologia} onValueChange={set("tipologia")}>
          <SelectTrigger id={id("tipologia")} className={fieldCls} aria-invalid={!!errors.tipologia} data-testid={`${idPrefix}-tipologia-select`}>
            <SelectValue placeholder={t("form.select")} />
          </SelectTrigger>
          <SelectContent className="border-ic-cyan2/20 bg-ic-night text-ic-white">
            <SelectItem value="personale" data-testid={`${idPrefix}-tipologia-personale`}>{t("form.personale")}</SelectItem>
            <SelectItem value="professionale" data-testid={`${idPrefix}-tipologia-professionale`}>{t("form.professionale")}</SelectItem>
            <SelectItem value="aziendale" data-testid={`${idPrefix}-tipologia-aziendale`}>{t("form.aziendale")}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field id={id("messaggio")} label={t("form.messaggio")} error={errors.messaggio}>
        <Textarea id={id("messaggio")} rows={5} placeholder={t("form.messaggioPh")} value={v.messaggio} onChange={set("messaggio")} maxLength={3000} className={`${fieldCls} h-auto min-h-[140px] py-3`} aria-invalid={!!errors.messaggio} data-testid={`${idPrefix}-messaggio-input`} />
      </Field>

      <div className="grid gap-4 pt-1">
        <div>
          <div className="flex items-start gap-3">
            <Checkbox id={id("privacy")} checked={v.privacy} onCheckedChange={(c) => setV((s) => ({ ...s, privacy: c === true }))} className="mt-0.5 border-ic-cyan2/50 data-[state=checked]:bg-ic-cyan data-[state=checked]:text-ic-bg" aria-invalid={!!errors.privacy} data-testid={`${idPrefix}-privacy-checkbox`} />
            <Label htmlFor={id("privacy")} className="text-[13px] font-normal leading-relaxed text-ic-grey">
              {t("form.privacyA")}<Link to="/privacy" target="_blank" className="text-ic-cyan2 underline underline-offset-2">{t("form.privacyLink")}</Link>. <span className="text-ic-white/80">*</span>
            </Label>
          </div>
          {errors.privacy && <p className="mt-2 pl-7 text-xs text-red-300" role="alert" data-testid={`${id("privacy")}-error`}>{t(`form.errors.${errors.privacy}`)}</p>}
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id={id("marketing")} checked={v.marketing} onCheckedChange={(c) => setV((s) => ({ ...s, marketing: c === true }))} className="mt-0.5 border-ic-cyan2/50 data-[state=checked]:bg-ic-cyan data-[state=checked]:text-ic-bg" data-testid={`${idPrefix}-marketing-checkbox`} />
          <Label htmlFor={id("marketing")} className="text-[13px] font-normal leading-relaxed text-ic-grey">
            {t("form.marketing")}
          </Label>
        </div>
      </div>

      {status === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200" role="alert" data-testid={`${idPrefix}-error-message`}>
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{t(`form.server.${serverMsg}`)}
        </div>
      )}

      <div className="flex flex-col-reverse items-start gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs text-ic-grey/60">{t("common.required")}</span>
        <PrimaryButton type="submit" disabled={status === "sending"} icon={status !== "sending"} data-testid={`${idPrefix}-submit-button`}>
          {status === "sending" ? (<><Loader2 className="h-4 w-4 animate-spin" aria-hidden />{t("form.sending")}</>) : t("form.submit")}
        </PrimaryButton>
      </div>
    </form>
  );
};
