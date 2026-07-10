import { comunicadosLinks } from "./navigation";
import type { HubSection } from "./pessoas-hub";

export const NOTICIAS_HUB_PATH = "/noticias";

export const NOTICIAS_SECTIONS: HubSection[] = [
  {
    id: "feed",
    label: "Notícias no feed",
    path: "/",
    description: "Publicações editoriais e destaques na timeline corporativa.",
    icon: "fa-newspaper",
    mod: "feed",
  },
  {
    id: "oficiais",
    label: comunicadosLinks[0].label,
    path: comunicadosLinks[0].path,
    description: "Comunicados institucionais e releases corporativos.",
    icon: "fa-bullhorn",
    mod: "oficiais",
  },
  {
    id: "departamentais",
    label: comunicadosLinks[1].label,
    path: comunicadosLinks[1].path,
    description: "Novidades publicadas por Marketing, RH, TI e outras áreas.",
    icon: "fa-building",
    mod: "departamentais",
  },
  {
    id: "arquivo",
    label: comunicadosLinks[3].label,
    path: comunicadosLinks[3].path,
    description: "Histórico de notícias e comunicados anteriores.",
    icon: "fa-box-archive",
    mod: "arquivo",
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
