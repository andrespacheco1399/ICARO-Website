import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Sets the document title from a translation key and updates it on language change. */
export function useDocTitle(key) {
  const { t, i18n } = useTranslation();
  useEffect(() => {
    document.title = t(key);
  }, [t, key, i18n.language]);
}
