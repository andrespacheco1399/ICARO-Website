import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import it from "./it";
import en from "./en";

export const LANGS = ["it", "en"];
const KEY = "icaro_lang";

function initialLang() {
  const q = new URLSearchParams(window.location.search).get("lang");
  if (LANGS.includes(q)) return q;
  let saved = null;
  try { saved = window.localStorage.getItem(KEY); } catch (e) {}
  return LANGS.includes(saved) ? saved : "it";
}

function applyMeta(lng) {
  document.documentElement.lang = lng;
  const desc = i18n.t("meta.description");
  document.querySelectorAll('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach((m) => m.setAttribute("content", desc));
  document.querySelector('meta[property="og:locale"]')?.setAttribute("content", lng === "en" ? "en_GB" : "it_IT");
}

i18n.use(initReactI18next).init({
  resources: { it: { translation: it }, en: { translation: en } },
  lng: initialLang(),
  fallbackLng: "it",
  supportedLngs: LANGS,
  interpolation: { escapeValue: false },
  returnObjects: true,
});

i18n.on("languageChanged", (lng) => {
  try { window.localStorage.setItem(KEY, lng); } catch (e) {}
  applyMeta(lng);
});
applyMeta(i18n.language);

// keep other open tabs in sync
window.addEventListener("storage", (e) => {
  if (e.key === KEY && LANGS.includes(e.newValue) && e.newValue !== i18n.language) i18n.changeLanguage(e.newValue);
});

export default i18n;
