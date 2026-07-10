import type { HubSection } from "./pessoas-hub";

export const PARABENIZACOES_HUB_PATH = "/parabenizacoes";

export const PARABENIZACOES_SECTIONS: HubSection[] = [
  {
    id: "feed",
    label: "Celebrações no feed",
    path: "/",
    description: "Parabenizações publicadas na timeline corporativa.",
    icon: "fa-champagne-glasses",
    mod: "feed",
  },
  {
    id: "aniversariantes",
    label: "Aniversariantes",
    path: "/pessoas/aniversariantes",
    description: "Celebre e parabenize colegas que fazem aniversário.",
    icon: "fa-cake-candles",
    mod: "aniversariantes",
  },
  {
    id: "novos",
    label: "Novos colaboradores",
    path: "/pessoas/novos-colaboradores",
    description: "Dê boas-vindas a quem acabou de integrar a Liotécnica.",
    icon: "fa-user-plus",
    mod: "novos",
  },
];

export function filterParabenizacoesSections(query: string): HubSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return PARABENIZACOES_SECTIONS;
  return PARABENIZACOES_SECTIONS.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
