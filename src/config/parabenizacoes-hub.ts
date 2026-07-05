import type { HubRecentItem, HubSection } from "./pessoas-hub";

export const PARABENIZACOES_HUB_PATH = "/parabenizacoes";

export const PARABENIZACOES_SECTIONS: HubSection[] = [
  {
    id: "feed",
    label: "Celebrações no feed",
    path: "/#feed-parabenizacoes",
    description: "Parabenizações publicadas na timeline corporativa.",
    icon: "fa-champagne-glasses",
    mod: "feed",
    count: "2 recentes",
  },
  {
    id: "aniversariantes",
    label: "Aniversariantes",
    path: "/pessoas/aniversariantes",
    description: "Celebre e parabenize colegas que fazem aniversário.",
    icon: "fa-cake-candles",
    mod: "aniversariantes",
    count: "12 esta semana",
  },
  {
    id: "novos",
    label: "Novos colaboradores",
    path: "/pessoas/novos-colaboradores",
    description: "Dê boas-vindas a quem acabou de integrar a Liotécnica.",
    icon: "fa-user-plus",
    mod: "novos",
    count: "6 este mês",
  },
  {
    id: "promocoes",
    label: "Promoções e reconhecimentos",
    path: "/#feed-parabenizacao-promocao",
    description: "Destaques de carreira, tempo de casa e conquistas da equipe.",
    icon: "fa-award",
    mod: "promocoes",
    count: "1 destaque",
  },
];

export const PARABENIZACOES_RECENT: HubRecentItem[] = [
  {
    id: "parab-5anos",
    title: "Parabéns por 5 anos — Alejandro López",
    section: "Tempo de casa",
    date: "Ontem",
    href: "/#feed-parabenizacoes",
    icon: "fa-champagne-glasses",
  },
  {
    id: "parab-promocao",
    title: "Promoção a Gerente de Projetos — Julia Santos",
    section: "Reconhecimento",
    date: "Há 6 horas",
    href: "/#feed-parabenizacao-promocao",
    icon: "fa-award",
  },
  {
    id: "parab-aniv",
    title: "Aniversariantes de julho",
    section: "Aniversariantes",
    date: "Hoje",
    href: "/pessoas/aniversariantes",
    icon: "fa-cake-candles",
  },
  {
    id: "parab-novos",
    title: "Novos integrantes — julho 2026",
    section: "Novos colaboradores",
    date: "02 jul 2026",
    href: "/pessoas/novos-colaboradores",
    icon: "fa-user-plus",
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
