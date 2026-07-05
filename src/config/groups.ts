import { pageAssets } from "../generated/pagesIndex";
import {
  GROUP_ACCESS_OPEN,
  GROUP_ACCESS_PRIVATE,
  GROUP_ACCESS_REQUIRES_APPROVAL,
  GROUP_STATUS_ACTIVE,
  GROUP_STATUS_PENDING,
  GROUP_STATUS_REJECTED,
  GROUP_TYPE_COMUNIDADE,
  GROUP_TYPE_DEPARTAMENTAL,
  GROUP_TYPE_INTERESSE,
  GROUP_TYPE_PROJETO,
  type GroupAccessMode,
  type GroupStatus,
  type GroupType,
} from "../api/types";

export const GROUP_CREATE_PAGE_ID = "grupos-criar-grupo";

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
    case GROUP_STATUS_PENDING:
    default:
      return "Aguardando aprovação";
  }
}

export function groupTypeLabel(type: GroupType): string {
  return GROUP_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "Grupo";
}

export function groupAccessLabel(accessMode: GroupAccessMode): string {
  return GROUP_ACCESS_OPTIONS.find((option) => option.value === accessMode)?.label ?? "Aberto";
}

export function injectGroupCreatePageStyles(): () => void {
  const attr = `data-page-style="${GROUP_CREATE_PAGE_ID}"`;
  document.querySelector(`style[${attr}]`)?.remove();

  const assets = pageAssets[GROUP_CREATE_PAGE_ID];
  if (!assets?.styles) return () => undefined;

  const el = document.createElement("style");
  el.setAttribute("data-page-style", GROUP_CREATE_PAGE_ID);
  el.textContent = assets.styles;
  document.head.appendChild(el);

  return () => {
    document.querySelector(`style[${attr}]`)?.remove();
  };
}
