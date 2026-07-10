import type { HubSection } from "./pessoas-hub";

export const ENQUETES_HUB_PATH = "/enquetes";

export const ENQUETES_SECTIONS: HubSection[] = [
  {
    id: "ativas",
    label: "Enquetes no feed",
    path: "/",
    description: "Participe das votações abertas publicadas no feed corporativo.",
    icon: "fa-chart-bar",
    mod: "ativas",
  },
  {
    id: "atividades",
    label: "Minhas participações",
    path: "/minhas-atividades",
    description: "Acompanhe enquetes respondidas e pendências de votação.",
    icon: "fa-list-check",
    mod: "atividades",
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
