import type { HubRecentItem, HubSection } from "./pessoas-hub";

export const ENQUETES_HUB_PATH = "/enquetes";

export const ENQUETES_SECTIONS: HubSection[] = [
  {
    id: "ativas",
    label: "Enquetes ativas",
    path: "/#feed-enquetes",
    description: "Participe das votações abertas publicadas no feed corporativo.",
    icon: "fa-chart-bar",
    mod: "ativas",
    count: "2 abertas",
  },
  {
    id: "lideranca",
    label: "Liderança e desenvolvimento",
    path: "/#feed-enquetes",
    description: "Temas de capacitação, palestras e gestão de equipes.",
    icon: "fa-user-graduate",
    mod: "lideranca",
    count: "1 enquete",
  },
  {
    id: "cultura",
    label: "Trabalho e cultura",
    path: "/#feed-enquete-trabalho",
    description: "Preferências sobre modelo de trabalho, clima e bem-estar.",
    icon: "fa-people-arrows",
    mod: "cultura",
    count: "1 enquete",
  },
  {
    id: "atividades",
    label: "Minhas participações",
    path: "/minhas-atividades",
    description: "Acompanhe enquetes respondidas e pendências de votação.",
    icon: "fa-list-check",
    mod: "atividades",
    count: "3 respondidas",
  },
];

export const ENQUETES_RECENT: HubRecentItem[] = [
  {
    id: "enq-lideranca",
    title: "Qual tema para a próxima palestra de liderança?",
    section: "Liderança",
    date: "Hoje",
    href: "/#feed-enquetes",
    icon: "fa-chart-bar",
  },
  {
    id: "enq-trabalho",
    title: "Qual modelo de trabalho você prefere para 2026?",
    section: "Trabalho e cultura",
    date: "Há 4 horas",
    href: "/#feed-enquete-trabalho",
    icon: "fa-chart-bar",
  },
  {
    id: "enq-clima",
    title: "Como você está se sentindo hoje?",
    section: "Bem-estar",
    date: "Hoje",
    href: "/",
    icon: "fa-face-smile",
  },
];

export function filterEnquetesSections(query: string): HubSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return ENQUETES_SECTIONS;
  return ENQUETES_SECTIONS.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}
