import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { CalendarPage } from "./components/pages/CalendarPage";
import { BookmarksPage } from "./components/pages/BookmarksPage";
import { FavoritesPage } from "./components/pages/FavoritesPage";
import { ShortcutsPage } from "./components/pages/ShortcutsPage";
import { HelpPage } from "./components/pages/HelpPage";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { ComunicadoReader } from "./components/pages/ComunicadoReader";
import { NotificationsPage } from "./components/pages/NotificationsPage";
import { LegacyPage, LegacyPageById } from "./components/pages/LegacyPage";
import { pageRegistry } from "./config/routes";

function App() {
  const perfilPage = pageRegistry.find((p) => p.id === "pessoas-perfil");

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/comunicados/leitura" element={<ComunicadoReader />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/atalhos" element={<ShortcutsPage />} />
        <Route path="/calendario" element={<CalendarPage />} />
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
