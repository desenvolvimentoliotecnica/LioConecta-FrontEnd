import { pageAssets } from "../generated/pagesIndex";
import { injectScopedPageStyle } from "../utils/pageInjectedStyles";
import {
  GROUP_ACCESS_OPEN,
  GROUP_ACCESS_PRIVATE,
  GROUP_ACCESS_REQUIRES_APPROVAL,
  GROUP_MEMBER_ROLE_MEMBER,
  GROUP_MEMBER_ROLE_MODERATOR,
  GROUP_MEMBER_ROLE_OWNER,
  GROUP_STATUS_ACTIVE,
  GROUP_STATUS_EXPIRED,
  GROUP_STATUS_PENDING,
  GROUP_STATUS_REJECTED,
  GROUP_TYPE_COMUNIDADE,
  GROUP_TYPE_DEPARTAMENTAL,
  GROUP_TYPE_INTERESSE,
  GROUP_TYPE_PROJETO,
  type GroupAccessMode,
  type GroupMemberRole,
  type GroupStatus,
  type GroupType,
} from "../api/types";

export const GROUP_CREATE_PAGE_ID = "grupos-criar-grupo";
export const GROUP_EXPLORE_PAGE_ID = "grupos-explorar";

export const GROUP_TYPE_OPTIONS: Array<{
  value: GroupType;
  label: string;
  description: string;
  icon: string;
  iconStyle: { background: string; color: string; borderColor: string };
}> = [
  {
    value: GROUP_TYPE_DEPARTAMENTAL,
    label: "Departamental",
    description: "Times e áreas da empresa.",
    icon: "fa-building",
    iconStyle: { background: "#ecfeff", color: "#0891b2", borderColor: "#67e8f9" },
  },
  {
    value: GROUP_TYPE_PROJETO,
    label: "Projeto",
    description: "Squads e iniciativas temporárias.",
    icon: "fa-diagram-project",
    iconStyle: { background: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" },
  },
  {
    value: GROUP_TYPE_INTERESSE,
    label: "Interesse",
    description: "Hobbies, clubes e temas transversais.",
    icon: "fa-heart",
    iconStyle: { background: "#fce7f3", color: "#db2777", borderColor: "#f9a8d4" },
  },
  {
    value: GROUP_TYPE_COMUNIDADE,
    label: "Comunidade",
    description: "Comitês, ERGs e grupos abertos.",
    icon: "fa-users",
    iconStyle: { background: "#ede9fe", color: "#7c3aed", borderColor: "#c4b5fd" },
  },
];

/** @deprecated Backend não usa mais modo de acesso na criação de grupos. Mantido só por compatibilidade. */
export const GROUP_ACCESS_OPTIONS: Array<{
  value: GroupAccessMode;
  label: string;
  description: string;
  icon: string;
  iconStyle: { background: string; color: string; borderColor: string };
}> = [
  {
    value: GROUP_ACCESS_OPEN,
    label: "Aberto",
    description: "Qualquer colaborador pode participar.",
    icon: "fa-lock-open",
    iconStyle: { background: "#dcfce7", color: "#15803d", borderColor: "#86efac" },
  },
  {
    value: GROUP_ACCESS_REQUIRES_APPROVAL,
    label: "Com aprovação",
    description: "Entrada sujeita à liberação do admin.",
    icon: "fa-user-check",
    iconStyle: { background: "#fef3c7", color: "#b45309", borderColor: "#fcd34d" },
  },
  {
    value: GROUP_ACCESS_PRIVATE,
    label: "Privado",
    description: "Somente convidados podem entrar.",
    icon: "fa-lock",
    iconStyle: { background: "#f1f5f9", color: "#475569", borderColor: "#cbd5e1" },
  },
];

export const GROUP_ICON_OPTIONS = [
  "fa-users",
  "fa-user-group",
  "fa-people-group",
  "fa-handshake",
  "fa-building",
  "fa-briefcase",
  "fa-diagram-project",
  "fa-lightbulb",
  "fa-rocket",
  "fa-code",
  "fa-comments",
  "fa-heart",
  "fa-calendar",
  "fa-music",
  "fa-gamepad",
  "fa-globe",
  "fa-bolt",
  "fa-book",
  "fa-graduation-cap",
  "fa-mug-hot",
] as const;

export function groupStatusLabel(status: GroupStatus): string {
  switch (status) {
    case GROUP_STATUS_ACTIVE:
      return "Ativo";
    case GROUP_STATUS_REJECTED:
      return "Rejeitado";
    case GROUP_STATUS_EXPIRED:
      return "Expirado";
    case GROUP_STATUS_PENDING:
    default:
      return "Aguardando aprovação";
  }
}

/** Classe de tag reaproveitando `.tag`/`.badge` já existentes no CSS global. */
export function groupStatusBadgeClass(status: GroupStatus): string {
  switch (status) {
    case GROUP_STATUS_ACTIVE:
      return "group-status-badge group-status-badge--active";
    case GROUP_STATUS_REJECTED:
      return "group-status-badge group-status-badge--rejected";
    case GROUP_STATUS_EXPIRED:
      return "group-status-badge group-status-badge--expired";
    case GROUP_STATUS_PENDING:
    default:
      return "group-status-badge group-status-badge--pending";
  }
}

export function groupTypeLabel(type: GroupType): string {
  return GROUP_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "Grupo";
}

/** @deprecated Backend não usa mais modo de acesso — mantido só por compatibilidade de exibição legada. */
export function groupAccessLabel(accessMode: GroupAccessMode): string {
  return GROUP_ACCESS_OPTIONS.find((option) => option.value === accessMode)?.label ?? "Aberto";
}

export function groupMemberRoleLabel(role: GroupMemberRole): string {
  switch (role) {
    case GROUP_MEMBER_ROLE_OWNER:
      return "Proprietário";
    case GROUP_MEMBER_ROLE_MODERATOR:
      return "Moderador";
    case GROUP_MEMBER_ROLE_MEMBER:
    default:
      return "Membro";
  }
}

export function injectGroupCreatePageStyles(): () => void {
  const assets = pageAssets[GROUP_CREATE_PAGE_ID];
  if (!assets?.styles) return () => undefined;
  return injectScopedPageStyle(GROUP_CREATE_PAGE_ID, assets.styles);
}

export function injectGroupExplorePageStyles(): () => void {
  const assets = pageAssets[GROUP_EXPLORE_PAGE_ID];
  if (!assets?.styles) return () => undefined;
  return injectScopedPageStyle(GROUP_EXPLORE_PAGE_ID, assets.styles);
}
