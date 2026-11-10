import "@/App.css";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import CorporatePage from "@/pages/CorporatePage";
import LegalPage from "@/pages/LegalPage";
import ExpertPage from "@/pages/ExpertPage";
import EcosystemPage from "@/pages/EcosystemPage";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/corporate" element={<CorporatePage />} />
        <Route path="/parla-con-un-esperto" element={<ExpertPage />} />
        <Route path="/ecosistema" element={<EcosystemPage />} />
        <Route path="/prova-icaro" element={<Navigate to="/ecosistema" replace />} />
        <Route path="/privacy" element={<LegalPage kind="privacy" />} />
        <Route path="/cookie" element={<LegalPage kind="cookie" />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(9,27,51,0.95)",
            border: "1px solid rgba(57,228,255,0.25)",
            color: "#F6FAFF",
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </HashRouter>
  );
}

export default App;
