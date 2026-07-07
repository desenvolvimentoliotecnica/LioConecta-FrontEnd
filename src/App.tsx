import { Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, RequireAuth } from "./components/auth/RequireAuth";
import { LoginPage } from "./components/auth/LoginPage";
import { AppShell } from "./components/layout/AppShell";
import { KioskShell } from "./components/layout/KioskShell";
import { ActivitiesPage } from "./components/pages/ActivitiesPage";
import { ComunicadosHubPage } from "./components/pages/ComunicadosHubPage";
import { EnquetesHubPage } from "./components/pages/EnquetesHubPage";
import { NoticiasHubPage } from "./components/pages/NoticiasHubPage";
import { ParabenizacoesHubPage } from "./components/pages/ParabenizacoesHubPage";
import { GroupApprovalsPage } from "./components/pages/GroupApprovalsPage";
import { GroupCreatePage } from "./components/pages/GroupCreatePage";
import { GroupExplorePage } from "./components/pages/GroupExplorePage";
import { GruposHubPage } from "./components/pages/GruposHubPage";
import { PessoasHubPage } from "./components/pages/PessoasHubPage";
import { DocumentsHubPage } from "./components/pages/DocumentsHubPage";
import { ContrachequePage } from "./components/contracheque/ContrachequePage";
import { BeneficiosPage } from "./components/beneficios/BeneficiosPage";
import { FeriasAusenciasPage } from "./components/ferias/FeriasAusenciasPage";
import { PontoEletronicoPage } from "./components/ponto/PontoEletronicoPage";
import { HelpDeskPage } from "./components/help-desk/HelpDeskPage";
import { CardapioPage } from "./components/facilities/CardapioPage";
import { RhHubPage } from "./components/pages/RhHubPage";
import { TiHubPage } from "./components/pages/TiHubPage";
import { CalendarPage } from "./components/pages/CalendarPage";
import { BookmarksPage } from "./components/pages/BookmarksPage";
import { FavoritesPage } from "./components/pages/FavoritesPage";
import { ShortcutsPage } from "./components/pages/ShortcutsPage";
import { HelpPage } from "./components/pages/HelpPage";
import { SitemapPage } from "./components/pages/SitemapPage";
import { AnalyticsPage } from "./components/pages/AnalyticsPage";
import { BackendConfigPage } from "./components/pages/BackendConfigPage";
import { AuditTrailPage } from "./components/pages/AuditTrailPage";
import { ObservabilityHubPage } from "./components/pages/ObservabilityHubPage";
import { WorkersHubPage } from "./components/admin/WorkersHubPage";
import { TotvsRmConfigPage } from "./components/admin/TotvsRmConfigPage";
import { EmailHubPage } from "./components/admin/EmailHubPage";
import { EmailConfigPage } from "./components/admin/EmailConfigPage";
import { OrganogramGovernancePage } from "./components/admin/OrganogramGovernancePage";
import { ComunicadoReader } from "./components/pages/ComunicadoReader";
import { ComunicadoEditorPage } from "./components/pages/ComunicadoEditorPage";
import { ComunicadosKindPage } from "./components/pages/ComunicadosKindPage";
import {
  COMUNICADOS_ARQUIVO_CONFIG,
  COMUNICADOS_DEPARTAMENTAIS_CONFIG,
  COMUNICADOS_OFICIAIS_CONFIG,
  COMUNICADOS_URGENTES_CONFIG,
} from "./config/comunicados-pages";
import { NotificationsPage } from "./components/pages/NotificationsPage";
import { KioskFeedPage } from "./components/pages/KioskFeedPage";
import { LegacyPage, LegacyPageById } from "./components/pages/LegacyPage";
import { pageRegistry } from "./config/routes";
import { LoopAccessGate } from "./components/loop/LoopAccessGate";
import { LoopShell } from "./components/loop/LoopShell";
import { LoopDashboardPage } from "./components/loop/pages/LoopDashboardPage";
import { LoopProjectsPage } from "./components/loop/pages/LoopProjectsPage";
import { LoopActivitiesPage } from "./components/loop/pages/LoopActivitiesPage";
import { LoopTeamsPage } from "./components/loop/pages/LoopTeamsPage";
import { LoopPlanningPage } from "./components/loop/pages/LoopPlanningPage";
import { LoopRisksPage } from "./components/loop/pages/LoopRisksPage";
import { LoopApprovalsPage } from "./components/loop/pages/LoopApprovalsPage";
import { LoopLessonsPage } from "./components/loop/pages/LoopLessonsPage";
import { LoopReportsPage } from "./components/loop/pages/LoopReportsPage";
import { PulseAccessGate } from "./components/pulse/PulseAccessGate";
import { PulseShell } from "./components/pulse/PulseShell";
import { PulseDashboardPage } from "./components/pulse/pages/PulseDashboardPage";
import { PulseDailysPage } from "./components/pulse/pages/PulseDailysPage";
import { PulseSprintPage } from "./components/pulse/pages/PulseSprintPage";
import { PulseBacklogPage } from "./components/pulse/pages/PulseBacklogPage";
import { PulseBoardPage } from "./components/pulse/pages/PulseBoardPage";
import { PulsePlanningPage } from "./components/pulse/pages/PulsePlanningPage";
import { PulseReviewPage } from "./components/pulse/pages/PulseReviewPage";
import { PulseRetroPage } from "./components/pulse/pages/PulseRetroPage";
import { PulseImpedimentsPage } from "./components/pulse/pages/PulseImpedimentsPage";
import { PulseMeetingsPage } from "./components/pulse/pages/PulseMeetingsPage";

function App() {
  const perfilPage = pageRegistry.find((p) => p.id === "pessoas-perfil");

  return (
    <Routes>
      <Route
        path="/acesso"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route element={<RequireAuth />}>
      <Route element={<KioskShell />}>
        <Route path="/quiosque" element={<KioskFeedPage />} />
        <Route path="/quiosque/comunicados/leitura" element={<ComunicadoReader variant="kiosk" />} />
      </Route>
      <Route element={<AppShell />}>
        <Route path="/comunicados/leitura" element={<ComunicadoReader />} />
        <Route
          path="/comunicados/oficiais/novo"
          element={<ComunicadoEditorPage config={COMUNICADOS_OFICIAIS_CONFIG} />}
        />
        <Route path="/comunicados/oficiais" element={<ComunicadosKindPage config={COMUNICADOS_OFICIAIS_CONFIG} />} />
        <Route
          path="/comunicados/departamentais/novo"
          element={<ComunicadoEditorPage config={COMUNICADOS_DEPARTAMENTAIS_CONFIG} />}
        />
        <Route
          path="/comunicados/departamentais"
          element={<ComunicadosKindPage config={COMUNICADOS_DEPARTAMENTAIS_CONFIG} />}
        />
        <Route
          path="/comunicados/urgentes/novo"
          element={<ComunicadoEditorPage config={COMUNICADOS_URGENTES_CONFIG} />}
        />
        <Route path="/comunicados/urgentes" element={<ComunicadosKindPage config={COMUNICADOS_URGENTES_CONFIG} />} />
        <Route path="/comunicados/arquivo" element={<ComunicadosKindPage config={COMUNICADOS_ARQUIVO_CONFIG} />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route
          path="/loop"
          element={
            <LoopAccessGate>
              <LoopShell />
            </LoopAccessGate>
          }
        >
          <Route index element={<LoopDashboardPage />} />
          <Route path="projetos" element={<LoopProjectsPage />} />
          <Route path="atividades" element={<LoopActivitiesPage />} />
          <Route path="equipes" element={<LoopTeamsPage />} />
          <Route path="planejamento" element={<LoopPlanningPage />} />
          <Route path="riscos" element={<LoopRisksPage />} />
          <Route path="aprovacoes" element={<LoopApprovalsPage />} />
          <Route path="aprendizados" element={<LoopLessonsPage />} />
          <Route path="relatorios" element={<LoopReportsPage />} />
        </Route>
        <Route
          path="/pulse"
          element={
            <PulseAccessGate>
              <PulseShell />
            </PulseAccessGate>
          }
        >
          <Route index element={<PulseDashboardPage />} />
          <Route path="dailys" element={<PulseDailysPage />} />
          <Route path="sprint" element={<PulseSprintPage />} />
          <Route path="backlog" element={<PulseBacklogPage />} />
          <Route path="board" element={<PulseBoardPage />} />
          <Route path="planning" element={<PulsePlanningPage />} />
          <Route path="review" element={<PulseReviewPage />} />
          <Route path="retro" element={<PulseRetroPage />} />
          <Route path="impedimentos" element={<PulseImpedimentsPage />} />
          <Route path="meetings" element={<PulseMeetingsPage />} />
        </Route>
        <Route path="/admin/configuracoes-backend" element={<BackendConfigPage />} />
        <Route path="/admin/trilha-auditoria" element={<AuditTrailPage />} />
        <Route path="/admin/observabilidade" element={<ObservabilityHubPage />} />
        <Route path="/admin/workers" element={<WorkersHubPage />} />
        <Route path="/admin/totvs-rm" element={<TotvsRmConfigPage />} />
        <Route path="/admin/email" element={<EmailHubPage />} />
        <Route path="/admin/email/config" element={<EmailConfigPage />} />
        <Route path="/admin/governanca/organograma" element={<OrganogramGovernancePage />} />
        <Route path="/minhas-atividades" element={<ActivitiesPage />} />
        <Route path="/ajuda" element={<HelpPage />} />
        <Route path="/mapa-do-site" element={<SitemapPage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/atalhos" element={<ShortcutsPage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/documentos" element={<DocumentsHubPage />} />
        <Route path="/comunicados" element={<ComunicadosHubPage />} />
        <Route path="/pessoas" element={<PessoasHubPage />} />
        <Route path="/grupos" element={<GruposHubPage />} />
        <Route path="/grupos/criar" element={<GroupCreatePage />} />
        <Route path="/grupos/explorar" element={<GroupExplorePage />} />
        <Route path="/grupos/aprovacoes" element={<GroupApprovalsPage />} />
        <Route path="/servicos/rh" element={<RhHubPage />} />
        <Route path="/servicos/contracheque" element={<ContrachequePage />} />
        <Route path="/servicos/beneficios" element={<BeneficiosPage />} />
        <Route path="/servicos/ferias-ausencias" element={<FeriasAusenciasPage />} />
        <Route path="/servicos/ponto-eletronico" element={<PontoEletronicoPage />} />
        <Route path="/servicos/help-desk" element={<HelpDeskPage />} />
        <Route path="/servicos/cardapio" element={<CardapioPage />} />
        <Route path="/servicos/ti" element={<TiHubPage />} />
        <Route path="/enquetes" element={<EnquetesHubPage />} />
        <Route path="/parabenizacoes" element={<ParabenizacoesHubPage />} />
        <Route path="/noticias" element={<NoticiasHubPage />} />
        {pageRegistry.map((page) => {
          if (
            page.id === "pessoas-perfil" ||
            page.id === "comunicados-oficiais" ||
            page.id === "comunicados-departamentais" ||
            page.id === "comunicados-urgentes" ||
            page.id === "comunicados-arquivo" ||
            page.id === "grupos-criar-grupo" ||
            page.id === "grupos-explorar" ||
            page.id === "servicos-contracheque" ||
            page.id === "servicos-beneficios" ||
            page.id === "servicos-ferias" ||
            page.id === "servicos-ponto" ||
            page.id === "servicos-help-desk"
          ) {
            return null;
          }
          return <Route key={page.id} path={page.route} element={<LegacyPage />} />;
        })}
        {perfilPage ? (
          <Route path="/pessoas/perfil" element={<LegacyPageById page={perfilPage} />} />
        ) : null}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
      </Route>
    </Routes>
  );
}

export default App;
