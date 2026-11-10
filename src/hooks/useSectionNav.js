import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Scrolls to an in-page section; from sub-pages it navigates home first. */
export function scrollToSection(id, { focusForm = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (focusForm) {
    setTimeout(() => document.querySelector(`#${id} input:not([type=hidden]):not([tabindex="-1"])`)?.focus({ preventScroll: true }), 700);
  }
  return true;
}

export function useSectionNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return useCallback(
    (id, opts) => {
      if (pathname === "/" && scrollToSection(id, opts)) return;
      if (pathname !== "/" && document.getElementById(id) && scrollToSection(id, opts)) return;
      navigate("/", { state: { section: id } });
    },
    [navigate, pathname]
  );
}

/** On mount, honours a #hash coming from another page. */
export function useHashScroll() {
  const location = useLocation();
  const id = location.state?.section || (location.hash ? location.hash.slice(1) : "");
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(() => scrollToSection(id, { focusForm: id === "contatti" }), 120);
    return () => clearTimeout(t);
  }, [id, location.key]);
}
