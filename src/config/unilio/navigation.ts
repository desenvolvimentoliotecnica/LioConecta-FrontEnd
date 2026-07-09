import { hasAnyPermission, hasPermission } from "../../api/auth";
import type { MeDto } from "../../api/types";
import type { UniLioPersona } from "./types";

export type UniLioNavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;
  /** @deprecated Use `permission` — kept for typing compatibility during migration. */
  personas?: UniLioPersona[];
  permission?: string | readonly string[];
  badge?: number;
};

const LEARNER_ACCESS = "unilio.access";

export const UNILIO_NAV_ITEMS: UniLioNavItem[] = [
  {
    id: "overview",
    label: "Visão Geral",
    path: "/unilio",
    icon: "fa-chart-pie",
    permission: LEARNER_ACCESS,
  },
  {
    id: "catalogo",
    label: "Catálogo",
    path: "/unilio/catalogo",
    icon: "fa-book-open",
    permission: LEARNER_ACCESS,
  },
  {
    id: "trilhas",
    label: "Trilhas",
    path: "/unilio/trilhas",
    icon: "fa-route",
    permission: LEARNER_ACCESS,
  },
  {
    id: "player",
    label: "Player",
    path: "/unilio/curso",
    icon: "fa-circle-play",
    permission: LEARNER_ACCESS,
  },
  {
    id: "avaliacoes",
    label: "Avaliações",
    path: "/unilio/avaliacoes",
    icon: "fa-clipboard-check",
    permission: "unilio.learn.assess",
  },
  {
    id: "certificados",
    label: "Certificados",
    path: "/unilio/certificados",
    icon: "fa-award",
    permission: "unilio.learn.certificates",
  },
  {
    id: "compliance",
    label: "Compliance",
    path: "/unilio/compliance",
    icon: "fa-shield-halved",
    permission: "unilio.compliance.read",
    badge: 2,
  },
  {
    id: "comunidade",
    label: "Comunidade",
    path: "/unilio/comunidade",
    icon: "fa-users",
    permission: "unilio.community.read",
  },
  {
    id: "minhas-duvidas",
    label: "Minhas Dúvidas",
    path: "/unilio/minhas-duvidas",
    icon: "fa-circle-question",
    permission: LEARNER_ACCESS,
  },
  {
    id: "recomendacoes",
    label: "Recomendações",
    path: "/unilio/recomendacoes",
    icon: "fa-lightbulb",
    permission: "unilio.recommendations.read",
  },
  {
    id: "instrutor",
    label: "Instrutor",
    path: "/unilio/instrutor",
    icon: "fa-chalkboard-user",
    permission: ["unilio.instructor.panel", "unilio.courses.author"],
  },
  {
    id: "aprovacoes",
    label: "Aprovações",
    path: "/unilio/admin/aprovacoes",
    icon: "fa-stamp",
    permission: "unilio.courses.approve",
  },
  {
    id: "gestor",
    label: "Meu Time",
    path: "/unilio/gestor",
    icon: "fa-people-group",
    permission: "unilio.team.view",
  },
  {
    id: "eventos",
    label: "Eventos",
    path: "/unilio/eventos",
    icon: "fa-calendar-days",
    permission: "unilio.events.read",
  },
  {
    id: "competencias",
    label: "Competências",
    path: "/unilio/competencias",
    icon: "fa-brain",
    permission: "unilio.skills.read",
  },
  {
    id: "relatorios",
    label: "Relatórios",
    path: "/unilio/relatorios",
    icon: "fa-file-lines",
    permission: "unilio.reports.view",
  },
];

function canSeeNavItem(me: MeDto | undefined | null, item: UniLioNavItem): boolean {
  const keys = item.permission ?? LEARNER_ACCESS;
  if (typeof keys === "string") {
    return hasPermission(me ?? undefined, keys) || hasPermission(me ?? undefined, LEARNER_ACCESS);
  }
  return hasAnyPermission(me ?? undefined, keys);
}

export function filterNavItemsForPermissions(me?: MeDto | null): UniLioNavItem[] {
  return UNILIO_NAV_ITEMS.filter((item) => item.id !== "player" && canSeeNavItem(me, item));
}

/** @deprecated Use `filterNavItemsForPermissions` with RBAC permissions. */
export function filterNavItemsForPersona(_persona: UniLioPersona): UniLioNavItem[] {
  return UNILIO_NAV_ITEMS.filter((item) => item.id !== "player");
}
