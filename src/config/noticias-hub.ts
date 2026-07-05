import { comunicadosLinks } from "./navigation";
import type { HubRecentItem, HubSection } from "./pessoas-hub";

export const NOTICIAS_HUB_PATH = "/noticias";

export const NOTICIAS_SECTIONS: HubSection[] = [
  {
    id: "feed",
    label: "Notícias no feed",
    path: "/#feed-noticias",
    description: "Publicações editoriais e destaques da LioConecta Notícias.",
    icon: "fa-newspaper",
    mod: "feed",
    count: "2 recentes",
  },
  {
    id: "oficiais",
    label: comunicadosLinks[0].label,
    path: comunicadosLinks[0].path,
    description: "Comunicados institucionais e releases corporativos.",
    icon: "fa-bullhorn",
    mod: "oficiais",
    count: "8 ativos",
  },
  {
    id: "departamentais",
    label: comunicadosLinks[1].label,
    path: comunicadosLinks[1].path,
    description: "Novidades publicadas por Marketing, RH, TI e outras áreas.",
    icon: "fa-building",
    mod: "departamentais",
    count: "5 recentes",
  },
  {
    id: "arquivo",
    label: comunicadosLinks[3].label,
    path: comunicadosLinks[3].path,
    description: "Histórico de notícias e comunicados anteriores.",
    icon: "fa-box-archive",
    mod: "arquivo",
    count: "124 arquivados",
  },
];

export const NOTICIAS_RECENT: HubRecentItem[] = [
  {
    id: "news-parcerias",
    title: "LioConecta anuncia novas parcerias estratégicas para 2026",
    section: "Feed",
    date: "Há 1 dia",
    href: "/#feed-noticias",
    icon: "fa-newspaper",
  },
  {
    id: "news-inovacao",
    title: "LioConecta inaugura centro de inovação e pesquisa aplicada",
    section: "Feed",
    date: "Há 2 dias",
    href: "/#feed-noticias",
    icon: "fa-flask",
  },
  {
    id: "news-oficial",
    title: "Atualização importante sobre nossa estratégia 2026",
    section: "Comunicados oficiais",
    date: "Hoje",
    href: "/comunicados/leitura?id=estrategia-2026",
    icon: "fa-bullhorn",
  },
  {
    id: "news-dept",
    title: "Campanha interna Q3 — alinhamento de áreas",
    section: "Departamentais",
    date: "Ontem",
    href: "/comunicados/departamentais",
    icon: "fa-building",
  },
];

export function filterNoticiasSections(query: string): HubSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return NOTICIAS_SECTIONS;
  return NOTICIAS_SECTIONS.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
