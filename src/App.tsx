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
import { GroupDetailPage } from "./components/pages/GroupDetailPage";
import { GroupExplorePage } from "./components/pages/GroupExplorePage";
import { GroupMyGroupsPage } from "./components/pages/GroupMyGroupsPage";
import { GruposHubPage } from "./components/pages/GruposHubPage";
import { PessoasHubPage } from "./components/pages/PessoasHubPage";
import { PhoneExtensionsPage } from "./components/pessoas/PhoneExtensionsPage";
import { DocumentsHubPage } from "./components/pages/DocumentsHubPage";
import { DocumentsBibliotecaPage } from "./components/pages/DocumentsBibliotecaPage";
import { ContrachequePage } from "./components/contracheque/ContrachequePage";
import { ContrachequeAcessosPage } from "./components/contracheque/ContrachequeAcessosPage";
import { BeneficiosPage } from "./components/beneficios/BeneficiosPage";
import { BeneficiosGestaoPage } from "./components/beneficios/BeneficiosGestaoPage";
import { FeriasAusenciasPage } from "./components/ferias/FeriasAusenciasPage";
import { FeriasGestaoPage } from "./components/ferias/FeriasGestaoPage";
import { PontoEletronicoPage } from "./components/ponto/PontoEletronicoPage";
import { PontoGestaoPage } from "./components/ponto/PontoGestaoPage";
import { HelpDeskPage } from "./components/help-desk/HelpDeskPage";
import { CardapioPage } from "./components/facilities/CardapioPage";
import { RhHubPage } from "./components/pages/RhHubPage";
import { TiHubPage } from "./components/pages/TiHubPage";
import { SystemsHubPage } from "./components/pages/SystemsHubPage";
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
import { ControleAcessoPage } from "./components/admin/ControleAcessoPage";
import { DbExplorerPage } from "./components/admin/DbExplorerPage";
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
import { CompassAccessGate } from "./components/compass/CompassAccessGate";
import { CompassShell } from "./components/compass/CompassShell";
import { CompassDashboardPage } from "./components/compass/pages/CompassDashboardPage";
import { CompassAnaliseYtdPage } from "./components/compass/pages/CompassAnaliseYtdPage";
import { CompassCicloPage } from "./components/compass/pages/CompassCicloPage";
import { CompassVolumePage } from "./components/compass/pages/CompassVolumePage";
import { CompassCanaisPage } from "./components/compass/pages/CompassCanaisPage";
import { CompassFinanceiroPage } from "./components/compass/pages/CompassFinanceiroPage";
import { CompassReconciliacaoPage } from "./components/compass/pages/CompassReconciliacaoPage";
import { CompassCenariosPage } from "./components/compass/pages/CompassCenariosPage";
import { CompassMeetingsPage } from "./components/compass/pages/CompassMeetingsPage";
import { CompassDecisionsPage } from "./components/compass/pages/CompassDecisionsPage";
import { CompassRelatoriosPage } from "./components/compass/pages/CompassRelatoriosPage";
import { UniLioAccessGate } from "./components/unilio/UniLioAccessGate";
import { UniLioShell } from "./components/unilio/UniLioShell";
import { UniLioDashboardPage } from "./components/unilio/pages/UniLioDashboardPage";
import { UniLioCatalogoPage } from "./components/unilio/pages/UniLioCatalogoPage";
import { UniLioTrilhasPage } from "./components/unilio/pages/UniLioTrilhasPage";
import { UniLioPlayerPage } from "./components/unilio/pages/UniLioPlayerPage";
import { UniLioAvaliacoesPage } from "./components/unilio/pages/UniLioAvaliacoesPage";
import { UniLioCertificadosPage } from "./components/unilio/pages/UniLioCertificadosPage";
import { UniLioCompliancePage } from "./components/unilio/pages/UniLioCompliancePage";
import { UniLioComunidadePage } from "./components/unilio/pages/UniLioComunidadePage";
import { UniLioRecomendacoesPage } from "./components/unilio/pages/UniLioRecomendacoesPage";
import { UniLioInstrutorPage } from "./components/unilio/pages/UniLioInstrutorPage";
import { UniLioInstrutorDuvidasPage } from "./components/unilio/pages/UniLioInstrutorDuvidasPage";
import { UniLioMinhasDuvidasPage } from "./components/unilio/pages/UniLioMinhasDuvidasPage";
import {
  UniLioAprovacaoListPage,
  UniLioAprovacaoReviewPage,
} from "./components/unilio/pages/UniLioAprovacaoPage";
import { UniLioCourseEditPage } from "./components/unilio/pages/UniLioCourseEditPage";
import { UniLioGestorPage } from "./components/unilio/pages/UniLioGestorPage";
import { UniLioEventosPage } from "./components/unilio/pages/UniLioEventosPage";
import { UniLioCompetenciasPage } from "./components/unilio/pages/UniLioCompetenciasPage";
import { UniLioRelatoriosPage } from "./components/unilio/pages/UniLioRelatoriosPage";

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
        <Route
          path="/compass"
          element={
            <CompassAccessGate>
              <CompassShell />
            </CompassAccessGate>
          }
        >
          <Route index element={<CompassDashboardPage />} />
          <Route path="analise-ytd" element={<CompassAnaliseYtdPage />} />
          <Route path="ciclo" element={<CompassCicloPage />} />
          <Route path="volume" element={<CompassVolumePage />} />
          <Route path="canais" element={<CompassCanaisPage />} />
          <Route path="demanda" element={<CompassVolumePage />} />
          <Route path="supply" element={<CompassCanaisPage />} />
          <Route path="financeiro" element={<CompassFinanceiroPage />} />
          <Route path="reconciliacao" element={<CompassReconciliacaoPage />} />
          <Route path="reunioes" element={<CompassMeetingsPage />} />
          <Route path="decisoes" element={<CompassDecisionsPage />} />
          <Route path="cenarios" element={<CompassCenariosPage />} />
          <Route path="relatorios" element={<CompassRelatoriosPage />} />
        </Route>
        <Route
          path="/unilio"
          element={
            <UniLioAccessGate>
              <UniLioShell />
            </UniLioAccessGate>
          }
        >
          <Route index element={<UniLioDashboardPage />} />
          <Route path="catalogo" element={<UniLioCatalogoPage />} />
          <Route path="trilhas" element={<UniLioTrilhasPage />} />
          <Route path="curso/:courseId" element={<UniLioPlayerPage />} />
          <Route path="avaliacoes" element={<UniLioAvaliacoesPage />} />
          <Route path="certificados" element={<UniLioCertificadosPage />} />
          <Route path="compliance" element={<UniLioCompliancePage />} />
          <Route path="comunidade" element={<UniLioComunidadePage />} />
          <Route path="minhas-duvidas" element={<UniLioMinhasDuvidasPage />} />
          <Route path="recomendacoes" element={<UniLioRecomendacoesPage />} />
          <Route path="instrutor" element={<UniLioInstrutorPage />} />
          <Route path="instrutor/duvidas" element={<UniLioInstrutorDuvidasPage />} />
          <Route path="instrutor/curso/:courseId/editar" element={<UniLioCourseEditPage />} />
          <Route path="admin/aprovacoes" element={<UniLioAprovacaoListPage />} />
          <Route path="admin/aprovacoes/:courseId" element={<UniLioAprovacaoReviewPage />} />
          <Route path="gestor" element={<UniLioGestorPage />} />
          <Route path="eventos" element={<UniLioEventosPage />} />
          <Route path="competencias" element={<UniLioCompetenciasPage />} />
          <Route path="relatorios" element={<UniLioRelatoriosPage />} />
        </Route>
        <Route path="/admin/configuracoes-backend" element={<BackendConfigPage />} />
        <Route path="/admin/controle-acesso" element={<ControleAcessoPage />} />
        <Route path="/admin/trilha-auditoria" element={<AuditTrailPage />} />
        <Route path="/admin/observabilidade" element={<ObservabilityHubPage />} />
        <Route path="/admin/db-explorer" element={<DbExplorerPage />} />
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
        <Route path="/documentos/biblioteca" element={<DocumentsBibliotecaPage />} />
        <Route path="/comunicados" element={<ComunicadosHubPage />} />
        <Route path="/pessoas" element={<PessoasHubPage />} />
        <Route path="/pessoas/ramais" element={<PhoneExtensionsPage />} />
        <Route path="/grupos" element={<GruposHubPage />} />
        <Route path="/grupos/meus-grupos" element={<GroupMyGroupsPage />} />
        <Route path="/grupos/criar" element={<GroupCreatePage />} />
        <Route path="/grupos/explorar" element={<GroupExplorePage />} />
        <Route path="/grupos/aprovacoes" element={<GroupApprovalsPage />} />
        <Route path="/grupos/:id" element={<GroupDetailPage />} />
        <Route path="/servicos/rh" element={<RhHubPage />} />
        <Route path="/servicos/contracheque" element={<ContrachequePage />} />
        <Route path="/servicos/contracheque/acessos" element={<ContrachequeAcessosPage />} />
        <Route path="/servicos/beneficios" element={<BeneficiosPage />} />
        <Route path="/servicos/beneficios/gestao" element={<BeneficiosGestaoPage />} />
        <Route path="/servicos/ferias-ausencias" element={<FeriasAusenciasPage />} />
        <Route path="/servicos/ferias-ausencias/gestao" element={<FeriasGestaoPage />} />
        <Route path="/servicos/ponto-eletronico" element={<PontoEletronicoPage />} />
        <Route path="/servicos/ponto-eletronico/gestao" element={<PontoGestaoPage />} />
        <Route path="/servicos/help-desk" element={<HelpDeskPage />} />
        <Route path="/servicos/cardapio" element={<CardapioPage />} />
        <Route path="/servicos/ti" element={<TiHubPage />} />
        <Route path="/servicos/acesso-sistemas" element={<SystemsHubPage />} />
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
            page.id === "grupos-meus-grupos" ||
            page.id === "documentos-biblioteca" ||
            page.id === "servicos-contracheque" ||
            page.id === "servicos-beneficios" ||
            page.id === "servicos-ferias" ||
            page.id === "servicos-ponto" ||
            page.id === "servicos-help-desk" ||
            page.id === "servicos-acesso-sistemas"
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
