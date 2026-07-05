import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ComunicadoReader } from "./components/pages/ComunicadoReader";
import { LegacyPage, LegacyPageById } from "./components/pages/LegacyPage";
import { pageRegistry } from "./config/routes";

function App() {
  const perfilPage = pageRegistry.find((p) => p.id === "pessoas-perfil");

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/comunicados/leitura" element={<ComunicadoReader />} />
        {pageRegistry.map((page) => {
          if (page.id === "pessoas-perfil") return null;
          return <Route key={page.id} path={page.route} element={<LegacyPage />} />;
        })}
        {perfilPage ? (
          <Route path="/pessoas/perfil" element={<LegacyPageById page={perfilPage} />} />
        ) : null}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
