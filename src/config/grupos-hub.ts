import type { GroupDto } from "../api/types";
import { gruposLinks } from "./navigation";

import type { HubRecentItem, HubSection } from "./pessoas-hub";

export const GRUPOS_SECTIONS: HubSection[] = [
  {
    id: "meus-grupos",
    label: gruposLinks[0].label,
    path: gruposLinks[0].path,
    description: "Grupos dos quais você participa e acompanha ativamente.",
    icon: "fa-user-group",
    mod: "meus",
    count: "8 grupos",
  },
  {
    id: "explorar",
    label: gruposLinks[1].label,
    path: gruposLinks[1].path,
    description: "Descubra grupos por tema, área ou interesse.",
    icon: "fa-compass",
    mod: "explorar",
    count: "48 disponíveis",
  },
  {
    id: "criar",
    label: gruposLinks[2].label,
    path: gruposLinks[2].path,
    description: "Inicie um novo grupo e convide colegas para participar.",
    icon: "fa-circle-plus",
    mod: "criar",
    count: "Novo grupo",
  },
];

export const GRUPOS_RECENT: HubRecentItem[] = [
  {
    id: "grupo-data",
    title: "Data & Analytics",
    section: "48 membros · 3 posts novos",
    date: "Hoje",
    href: "/grupos/explorar",
    icon: "fa-people-group",
  },
  {
    id: "grupo-rh",
    title: "RH & Inovação",
    section: "Comunicados semanais",
    date: "Ontem",
    href: "/grupos/meus-grupos",
    icon: "fa-people-group",
  },
  {
    id: "grupo-marketing",
    title: "Marketing Criativo",
    section: "Campanhas Q3",
    date: "30 jun 2026",
    href: "/grupos/meus-grupos",
    icon: "fa-people-group",
  },
  {
    id: "grupo-ti",
    title: "DevOps & Infra",
    section: "12 membros",
    date: "28 jun 2026",
    href: "/grupos/explorar",
    icon: "fa-people-group",
  },
];

export function filterGruposSections(
  query: string,
  sections: HubSection[] = GRUPOS_SECTIONS,
): HubSection[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return sections;
  return sections.filter(
    (section) =>
      section.label.toLowerCase().includes(normalized) ||
      section.description.toLowerCase().includes(normalized),
  );
}

export function buildGruposSections(
  myGroupsCount: number | null,
  exploreCount: number | null,
): HubSection[] {
  return GRUPOS_SECTIONS.map((section) => {
    if (section.id === "meus-grupos" && myGroupsCount !== null) {
      return { ...section, count: `${myGroupsCount} grupo${myGroupsCount === 1 ? "" : "s"}` };
    }
    if (section.id === "explorar" && exploreCount !== null) {
      return { ...section, count: `${exploreCount} disponíve${exploreCount === 1 ? "l" : "is"}` };
    }
    return section;
  });
}

function formatRecentDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function buildGruposRecentFromGroups(groups: GroupDto[]): HubRecentItem[] {
  return groups
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map((group) => ({
      id: group.id,
      title: group.name,
      section: `${group.memberCount} membro${group.memberCount === 1 ? "" : "s"} · ${group.topicCount} tópicos`,
      date: formatRecentDate(group.createdAt),
      href: `/grupos/${group.id}`,
      icon: "fa-people-group",
    }));
}
