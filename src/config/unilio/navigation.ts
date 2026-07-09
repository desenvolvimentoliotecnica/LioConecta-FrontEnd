import type { UniLioPersona } from "./types";

export type UniLioNavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  personas: UniLioPersona[];
  badge?: number;
};

export const UNILIO_NAV_ITEMS: UniLioNavItem[] = [
  {
    id: "overview",
    label: "Visão Geral",
    path: "/unilio",
    icon: "fa-chart-pie",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "catalogo",
    label: "Catálogo",
    path: "/unilio/catalogo",
    icon: "fa-book-open",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "trilhas",
    label: "Trilhas",
    path: "/unilio/trilhas",
    icon: "fa-route",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "player",
    label: "Player",
    path: "/unilio/curso",
    icon: "fa-circle-play",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "avaliacoes",
    label: "Avaliações",
    path: "/unilio/avaliacoes",
    icon: "fa-clipboard-check",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "certificados",
    label: "Certificados",
    path: "/unilio/certificados",
    icon: "fa-award",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "compliance",
    label: "Compliance",
    path: "/unilio/compliance",
    icon: "fa-shield-halved",
    personas: ["learner", "manager", "instructor", "admin"],
    badge: 2,
  },
  {
    id: "comunidade",
    label: "Comunidade",
    path: "/unilio/comunidade",
    icon: "fa-users",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "recomendacoes",
    label: "Recomendações",
    path: "/unilio/recomendacoes",
    icon: "fa-lightbulb",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "instrutor",
    label: "Instrutor",
    path: "/unilio/instrutor",
    icon: "fa-chalkboard-user",
    personas: ["instructor", "admin"],
  },
  {
    id: "aprovacoes",
    label: "Aprovações",
    path: "/unilio/admin/aprovacoes",
    icon: "fa-stamp",
    personas: ["admin"],
  },
  {
    id: "gestor",
    label: "Meu Time",
    path: "/unilio/gestor",
    icon: "fa-people-group",
    personas: ["manager", "admin"],
  },
  {
    id: "eventos",
    label: "Eventos",
    path: "/unilio/eventos",
    icon: "fa-calendar-days",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "competencias",
    label: "Competências",
    path: "/unilio/competencias",
    icon: "fa-brain",
    personas: ["learner", "manager", "instructor", "admin"],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    path: "/unilio/relatorios",
    icon: "fa-file-lines",
    personas: ["manager", "admin"],
  },
];

export function filterNavItemsForPersona(persona: UniLioPersona): UniLioNavItem[] {
  return UNILIO_NAV_ITEMS.filter((item) => item.personas.includes(persona) && item.id !== "player");
}
