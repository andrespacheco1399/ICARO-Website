import { useTranslation } from "react-i18next";
import {
  Headset, MailCheck, Contact, FileSearch, GitBranch, MessagesSquare,
} from "lucide-react";

/* Structure only — all visible copy lives in src/i18n/{it,en}.js */

const NAV = [
  { id: "home", key: "nav.home" },
  { id: "come-funziona", key: "nav.journey" },
  { id: "corporate", key: "nav.corporate" },
  { id: "contatti", key: "nav.contact" },
];

// Use-case titles are product names and stay untranslated.
const USE_CASES = [
  { id: "customer", icon: Headset, title: "Customer Management" },
  { id: "email", icon: MailCheck, title: "Email Automation" },
  { id: "crm", icon: Contact, title: "CRM Intelligence" },
  { id: "document", icon: FileSearch, title: "Document Intelligence" },
  { id: "workflow", icon: GitBranch, title: "Workflow Automation" },
  { id: "assistant", icon: MessagesSquare, title: "Business Assistant" },
];

export const STEP_IDS = ["01", "02", "03", "04"];

export const CORE_MODULES = ["EMAIL", "CRM", "CALENDAR", "DOCUMENTS", "WORKFLOW", "DATABASE"];

export function useNavLinks() {
  const { t } = useTranslation();
  return NAV.map((l) => ({ id: l.id, label: t(l.key) }));
}

export function useUseCases() {
  const { t } = useTranslation();
  return USE_CASES.map((u) => ({ ...u, text: t(`useCases.${u.id}`) }));
}

export function useSteps() {
  const { t } = useTranslation();
  return t("journey.steps").map((s, i) => ({ n: STEP_IDS[i], ...s }));
}
