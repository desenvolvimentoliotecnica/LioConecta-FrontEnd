import { getPageByRoute } from "../config/routes";

export type RouteMeta = {
  pageName: string;
  routeTemplate: string;
  module: string;
};

type RouteDefinition = RouteMeta & {
  match: (pathname: string) => boolean;
};

const UUID_SEGMENT = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function exact(path: string, meta: Omit<RouteMeta, "routeTemplate"> & { routeTemplate?: string }): RouteDefinition {
  const routeTemplate = meta.routeTemplate ?? path;
  return {
    pageName: meta.pageName,
    routeTemplate,
    module: meta.module,
    match: (pathname) => pathname === path || pathname.startsWith(`${path}/`),
  };
}

const ROUTE_DEFINITIONS: RouteDefinition[] = [
  exact("/", { pageName: "Home", module: "home" }),
  exact("/analytics", { pageName: "Analytics", module: "analytics" }),
  exact("/loop", { pageName: "LoopDashboard", module: "loop" }),
  exact("/pulse", { pageName: "PulseDashboard", module: "pulse" }),
  exact("/compass", { pageName: "CompassDashboard", module: "compass" }),
  exact("/unilio", { pageName: "UniLioDashboard", module: "unilio" }),
  exact("/admin/configuracoes-backend", { pageName: "BackendConfig", module: "admin" }),
  exact("/admin/controle-acesso", { pageName: "ControleAcesso", module: "admin" }),
  exact("/admin/trilha-auditoria", { pageName: "AuditTrail", module: "admin" }),
  exact("/admin/observabilidade", { pageName: "ObservabilityHub", module: "admin" }),
  exact("/admin/workers", { pageName: "WorkersHub", module: "admin" }),
  exact("/admin/totvs-rm", { pageName: "TotvsRmConfig", module: "admin" }),
  exact("/admin/email", { pageName: "EmailHub", module: "admin" }),
  exact("/admin/email/config", { pageName: "EmailConfig", module: "admin" }),
  exact("/admin/governanca/organograma", { pageName: "OrganogramGovernance", module: "admin" }),
  exact("/minhas-atividades", { pageName: "Activities", module: "home" }),
  exact("/ajuda", { pageName: "Help", module: "home" }),
  exact("/mapa-do-site", { pageName: "Sitemap", module: "home" }),
  exact("/favoritos", { pageName: "Favorites", module: "home" }),
  exact("/bookmarks", { pageName: "Bookmarks", module: "home" }),
  exact("/atalhos", { pageName: "Shortcuts", module: "home" }),
  exact("/calendario", { pageName: "Calendar", module: "home" }),
  exact("/documentos", { pageName: "Documents", module: "documentos" }),
  exact("/comunicados", { pageName: "ComunicadosHub", module: "comunicados" }),
  exact("/comunicados/leitura", { pageName: "ComunicadoReader", module: "comunicados" }),
  exact("/comunicados/oficiais", { pageName: "ComunicadosOficiais", module: "comunicados" }),
  exact("/comunicados/oficiais/novo", { pageName: "ComunicadoEditorOficiais", module: "comunicados" }),
  exact("/comunicados/departamentais", { pageName: "ComunicadosDepartamentais", module: "comunicados" }),
  exact("/comunicados/departamentais/novo", { pageName: "ComunicadoEditorDepartamentais", module: "comunicados" }),
  exact("/comunicados/urgentes", { pageName: "ComunicadosUrgentes", module: "comunicados" }),
  exact("/comunicados/urgentes/novo", { pageName: "ComunicadoEditorUrgentes", module: "comunicados" }),
  exact("/comunicados/arquivo", { pageName: "ComunicadosArquivo", module: "comunicados" }),
  exact("/notificacoes", { pageName: "Notifications", module: "home" }),
  exact("/pessoas", { pageName: "PessoasHub", module: "pessoas" }),
  exact("/pessoas/ramais", { pageName: "PhoneExtensions", module: "pessoas" }),
  exact("/pessoas/perfil", { pageName: "PersonProfile", routeTemplate: "/pessoas/perfil/:slug", module: "pessoas" }),
  exact("/grupos", { pageName: "GruposHub", module: "grupos" }),
  exact("/grupos/meus-grupos", { pageName: "GroupMyGroups", module: "grupos" }),
  exact("/grupos/criar", { pageName: "GroupCreate", module: "grupos" }),
  exact("/grupos/explorar", { pageName: "GroupExplore", module: "grupos" }),
  exact("/grupos/aprovacoes", { pageName: "GroupApprovals", module: "grupos" }),
  exact("/servicos/rh", { pageName: "RhHub", module: "rh" }),
  exact("/servicos/contracheque", { pageName: "Contracheque", module: "rh" }),
  exact("/servicos/beneficios", { pageName: "Beneficios", module: "rh" }),
  exact("/servicos/beneficios/gestao", { pageName: "BeneficiosGestao", module: "rh" }),
  exact("/servicos/ferias-ausencias", { pageName: "FeriasAusencias", module: "rh" }),
  exact("/servicos/ferias-ausencias/gestao", { pageName: "FeriasGestao", module: "rh" }),
  exact("/servicos/ponto-eletronico", { pageName: "PontoEletronico", module: "rh" }),
  exact("/servicos/ponto-eletronico/gestao", { pageName: "PontoGestao", module: "rh" }),
  exact("/servicos/ti", { pageName: "TiHub", module: "ti" }),
  exact("/servicos/acesso-sistemas", { pageName: "SystemsHub", module: "ti" }),
  exact("/enquetes", { pageName: "EnquetesHub", module: "enquetes" }),
  exact("/parabenizacoes", { pageName: "ParabenizacoesHub", module: "parabenizacoes" }),
  exact("/noticias", { pageName: "NoticiasHub", module: "noticias" }),
  exact("/quiosque", { pageName: "KioskFeed", module: "quiosque" }),
  exact("/quiosque/comunicados/leitura", { pageName: "KioskComunicadoReader", module: "quiosque" }),
];

function inferModule(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment || "home";
}

function normalizeDynamicSegments(pathname: string): string {
  return pathname
    .split("/")
    .map((segment) => {
      if (!segment) {
        return segment;
      }

      if (UUID_SEGMENT.test(segment)) {
        return ":id";
      }

      if (/^\d+$/.test(segment)) {
        return ":id";
      }

      return segment;
    })
    .join("/");
}

function titleCaseSegment(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function resolveRouteMeta(pathname: string): RouteMeta {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  const sorted = [...ROUTE_DEFINITIONS].sort(
    (a, b) => b.routeTemplate.length - a.routeTemplate.length
  );

  for (const route of sorted) {
    if (route.match(normalizedPath)) {
      return {
        pageName: route.pageName,
        routeTemplate: route.routeTemplate,
        module: route.module,
      };
    }
  }

  const legacyPage = getPageByRoute(normalizedPath);
  if (legacyPage) {
    return {
      pageName: titleCaseSegment(legacyPage.id),
      routeTemplate: legacyPage.route,
      module: inferModule(legacyPage.route),
    };
  }

  const routeTemplate = normalizeDynamicSegments(normalizedPath);
  const lastSegment = normalizedPath.split("/").filter(Boolean).pop() ?? "Home";

  return {
    pageName: titleCaseSegment(lastSegment) || "Unknown",
    routeTemplate,
    module: inferModule(normalizedPath),
  };
}

export function resolveReferrerTemplate(referrerPath?: string): string | undefined {
  if (!referrerPath) {
    return undefined;
  }

  return resolveRouteMeta(referrerPath).routeTemplate;
}
