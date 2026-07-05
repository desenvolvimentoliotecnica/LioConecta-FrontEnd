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
      ],
    },
    {
      id: "comunicados",
      label: "Comunicados",
      icon: "fa-bullhorn",
      items: [
        ...comunicadosLinks.map((item) => fromNav(item)),
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
          items: servicosLinks.slice(0, 6).map((item) => fromNav(item)),
        },
        {
          heading: servicosHeadings[1].label,
          icon: servicosHeadings[1].icon,
          items: servicosLinks.slice(6, 8).map((item) => fromNav(item)),
        },
        {
          heading: servicosHeadings[2].label,
          icon: servicosHeadings[2].icon,
          items: tiLinks.map((item) => fromNav(item)),
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
        entry("Minhas atividades", "/minhas-atividades", "Diário de tarefas e pendências."),
        entry("Analytics", "/analytics", "Indicadores e métricas de uso do portal."),
        entry("Ajuda", "/ajuda", "Central de ajuda e perguntas frequentes."),
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
      id: "em-desenvolvimento",
      label: "Em desenvolvimento",
      icon: "fa-screwdriver-wrench",
      items: [entry("Configurações", "#", "Preferências e personalização da conta.", true)],
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
