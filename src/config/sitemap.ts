/**
 * Mapa do site do LioConecta (`/mapa-do-site`).
 *
 * DIRETRIZ: este arquivo deve SEMPRE ser revisado e atualizado quando necessário
 * em qualquer mudança no projeto que afete rotas, menus, sidebars ou páginas.
 * Ver também `.cursor/rules/sitemap-maintenance.mdc`.
 */
import type { NavLinkItem } from "./navigation";
import {
  FEED_PATH,
  comunicadosLinks,
  documentosLinks,
  facilitiesLinks,
  gruposLinks,
  juridicoLinks,
  pessoasLinks,
  servicosHeadings,
  servicosLinks,
  tiLinks,
} from "./navigation";

export type SitemapEntry = {
  label: string;
  path: string;
  description?: string;
  disabled?: boolean;
};

export type SitemapSubsection = {
  heading: string;
  icon: string;
  items: SitemapEntry[];
};

export type SitemapSection = {
  id: string;
  label: string;
  icon: string;
  items?: SitemapEntry[];
  subsections?: SitemapSubsection[];
};

export const SITEMAP_DEFAULT_EXPANDED = ["feed", "comunicados", "pessoas"] as const;

function fromNav(item: NavLinkItem, description?: string): SitemapEntry {
  return {
    label: item.label,
    path: item.path,
    description,
    disabled: item.path === "#",
  };
}

function entry(label: string, path: string, description?: string, disabled = false): SitemapEntry {
  return { label, path, description, disabled };
}

export function buildSitemapSections(): SitemapSection[] {
  return [
    {
      id: "feed",
      label: "Feed",
      icon: "fa-house",
      items: [
        entry(
          "Feed",
          FEED_PATH,
          "Página inicial com publicações, comunicados, enquetes e interações da rede corporativa.",
        ),
        entry(
          "Hub Enquetes",
          "/enquetes",
          "Central de enquetes ativas, temas em votação e participações no feed.",
        ),
        entry(
          "Hub Parabenizações",
          "/parabenizacoes",
          "Celebrações no feed, aniversariantes, novos colaboradores e reconhecimentos.",
        ),
        entry(
          "Hub Notícias",
          "/noticias",
          "Notícias editoriais do feed e atalhos para comunicados institucionais.",
        ),
      ],
    },
    {
      id: "comunicados",
      label: "Comunicados",
      icon: "fa-bullhorn",
      items: [
        entry(
          "Hub Comunicados",
          "/comunicados",
          "Página central com atalhos para oficiais, departamentais, urgentes e arquivo.",
        ),
        ...comunicadosLinks.map((item) => fromNav(item)),
        entry(
          "Novo comunicado oficial",
          "/comunicados/oficiais/novo",
          "Editor para redigir e publicar comunicados institucionais na área de oficiais.",
        ),
        entry(
          "Novo comunicado departamental",
          "/comunicados/departamentais/novo",
          "Editor para publicar avisos e atualizações de áreas e departamentos.",
        ),
        entry(
          "Novo comunicado urgente",
          "/comunicados/urgentes/novo",
          "Editor para publicar avisos prioritários com ação imediata.",
        ),
        entry(
          "Leitor de comunicados",
          "/comunicados/leitura",
          "Visualização completa de um comunicado selecionado (requer parâmetro id na URL).",
        ),
      ],
    },
    {
      id: "pessoas",
      label: "Pessoas",
      icon: "fa-users",
      items: [
        entry("Hub Pessoas", "/pessoas", "Página central com atalhos para todas as áreas de pessoas."),
        ...pessoasLinks.map((item) => fromNav(item)),
        entry(
          "Perfil do colaborador",
          "/pessoas/perfil",
          "Perfil detalhado de um colaborador (requer parâmetros na URL).",
        ),
      ],
    },
    {
      id: "grupos",
      label: "Grupos",
      icon: "fa-user-group",
      items: [
        entry("Hub Grupos", "/grupos", "Página central com atalhos para grupos e comunidades."),
        ...gruposLinks.map((item) => fromNav(item)),
      ],
    },
    {
      id: "documentos",
      label: "Documentos",
      icon: "fa-folder-open",
      items: [
        entry("Hub Documentos", "/documentos", "Página central com atalhos para biblioteca e formulários."),
        ...documentosLinks.map((item) => fromNav(item)),
      ],
    },
    {
      id: "calendario",
      label: "Calendário",
      icon: "fa-calendar-days",
      items: [
        entry(
          "Calendário corporativo",
          "/calendario",
          "Eventos, feriados e cardápio do refeitório.",
        ),
      ],
    },
    {
      id: "servicos",
      label: "Serviços",
      icon: "fa-briefcase",
      subsections: [
        {
          heading: servicosHeadings[0].label,
          icon: servicosHeadings[0].icon,
          items: [
            entry(
              "Hub Recursos Humanos",
              "/servicos/rh",
              "Página central com atalhos para benefícios, contracheque, férias e solicitações.",
            ),
            ...servicosLinks.slice(0, 6).map((item) => fromNav(item)),
          ],
        },
        {
          heading: servicosHeadings[1].label,
          icon: servicosHeadings[1].icon,
          items: servicosLinks.slice(6, 8).map((item) => fromNav(item)),
        },
        {
          heading: servicosHeadings[2].label,
          icon: servicosHeadings[2].icon,
          items: [
            entry(
              "Hub TI & Suporte",
              "/servicos/ti",
              "Página central com atalhos para Help Desk, equipamentos, acessos e VPN.",
            ),
            ...tiLinks.map((item) => fromNav(item)),
          ],
        },
        {
          heading: servicosHeadings[3].label,
          icon: servicosHeadings[3].icon,
          items: facilitiesLinks.map((item) => fromNav(item)),
        },
        {
          heading: servicosHeadings[4].label,
          icon: servicosHeadings[4].icon,
          items: juridicoLinks.map((item) => fromNav(item)),
        },
      ],
    },
    {
      id: "utilitarios",
      label: "Utilitários",
      icon: "fa-toolbox",
      items: [
        entry("Notificações", "/notificacoes", "Central de alertas e avisos do portal."),
        entry("Minhas atividades", "/minhas-atividades", "Tarefas do plano Microsoft Planner da equipe."),
        entry("Analytics", "/analytics", "Indicadores e métricas de uso do portal."),
        entry("Ajuda", "/ajuda", "Central de ajuda e perguntas frequentes."),
        entry(
          "Acesso ao portal",
          "/acesso",
          "Login corporativo por LDAP — página pública de autenticação.",
        ),
        entry("Mapa do site", "/mapa-do-site", "Visão completa de todas as páginas do LioConecta."),
        entry("Favoritos", "/favoritos", "Conteúdos marcados com estrela."),
        entry("Bookmarks", "/bookmarks", "Links e conteúdos salvos para consulta."),
        entry("Atalhos", "/atalhos", "Acesso rápido personalizado às páginas mais usadas."),
      ],
    },
    {
      id: "quiosque",
      label: "Quiosque",
      icon: "fa-tablet-screen-button",
      items: [
        entry(
          "Feed do quiosque",
          "/quiosque",
          "Modo totem sem menus laterais — ideal para telas compartilhadas.",
        ),
        entry(
          "Leitor do quiosque",
          "/quiosque/comunicados/leitura",
          "Leitura de comunicados no modo quiosque (requer parâmetro id na URL).",
        ),
      ],
    },
    {
      id: "administracao",
      label: "Administração",
      icon: "fa-shield-halved",
      items: [
        entry(
          "Configurações do Backend",
          "/admin/configuracoes-backend",
          "Credenciais, integrações e parâmetros operacionais — persistidos no banco.",
        ),
        entry(
          "Trilha de auditoria",
          "/admin/trilha-auditoria",
          "Consulta paginada de eventos de mutações HTTP e alterações de entidades.",
        ),
        entry(
          "Observabilidade",
          "/admin/observabilidade",
          "Hub de logs, métricas, acessos e investigação por correlation ID.",
        ),
        entry(
          "Workers",
          "/admin/workers",
          "Monitoramento de jobs em background — execuções, logs e disparo manual.",
        ),
        entry(
          "TOTVS RM — Ponto",
          "/admin/totvs-rm",
          "Configuração SQL Server read-only para integração de espelho de ponto.",
        ),
        entry(
          "E-mail — Fila",
          "/admin/email",
          "Observabilidade da fila transacional de e-mails — status, retry e falhas.",
        ),
        entry(
          "E-mail — SMTP",
          "/admin/email/config",
          "Configuração SMTP persistida em banco — host, credenciais e parâmetros de retry.",
        ),
        entry(
          "Configurações observabilidade",
          "/admin/configuracoes-backend?category=observability",
          "Retenção, OTel, page views e access audit — seção observability do backend.",
        ),
        entry(
          "Aprovações de grupos",
          "/grupos/aprovacoes",
          "Fila de grupos aguardando aprovação de administrador.",
        ),
      ],
    },
    {
      id: "em-desenvolvimento",
      label: "Em desenvolvimento",
      icon: "fa-screwdriver-wrench",
      items: [entry("Configurações da conta", "#", "Preferências e personalização do usuário.", true)],
    },
  ];
}

export function getSectionEntries(section: SitemapSection): SitemapEntry[] {
  if (section.items) return section.items;
  return section.subsections?.flatMap((sub) => sub.items) ?? [];
}

export function countSitemapEntries(sections: SitemapSection[]): number {
  return sections.reduce((total, section) => total + getSectionEntries(section).length, 0);
}

function matchesQuery(entry: SitemapEntry, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  const haystack = [entry.label, entry.path, entry.description ?? ""]
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalizedQuery);
}

export function filterSitemapSections(
  sections: SitemapSection[],
  query: string,
): SitemapSection[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return sections;

  const filtered: SitemapSection[] = [];

  for (const section of sections) {
    if (section.items) {
      const items = section.items.filter((item) => matchesQuery(item, normalizedQuery));
      if (items.length > 0) {
        filtered.push({ ...section, items });
      }
      continue;
    }

    if (section.subsections) {
      const subsections = section.subsections
        .map((sub) => ({
          ...sub,
          items: sub.items.filter((item) => matchesQuery(item, normalizedQuery)),
        }))
        .filter((sub) => sub.items.length > 0);
      if (subsections.length > 0) {
        filtered.push({ ...section, subsections });
      }
    }
  }

  return filtered;
}
