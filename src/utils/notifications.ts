import type { NotificationDto } from "../api/types";
import type { NotificationFilter, NotificationItem, NotificationMod } from "../config/notifications";

const TYPE_TO_MOD: Record<string, NotificationMod> = {
  Comunicado: "comunicado",
  Feed: "social",
  ServiceRequest: "servico",
  Mention: "social",
  Birthday: "social",
  System: "documento",
  comunicado: "comunicado",
  feed: "social",
  servicerequest: "servico",
  mention: "social",
  birthday: "social",
  system: "documento",
  "0": "comunicado",
  "1": "social",
  "2": "servico",
  "3": "social",
  "4": "social",
  "5": "documento",
};

const MOD_ICONS: Record<NotificationMod, string> = {
  comunicado: "fa-bullhorn",
  rh: "fa-clipboard-check",
  social: "fa-user-group",
  documento: "fa-file-lines",
  servico: "fa-box",
  grupo: "fa-users",
};

export function notificationTypeToMod(type: string | number): NotificationMod {
  const key = String(type);
  return TYPE_TO_MOD[key] ?? TYPE_TO_MOD[key.toLowerCase()] ?? "documento";
}

export function notificationModIcon(mod: NotificationMod): string {
  return MOD_ICONS[mod];
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();

  if (Number.isNaN(diffMs)) {
    return "Agora";
  }

  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "Agora";
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? "Há 1 minuto" : `Há ${diffMinutes} minutos`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "Há 1 hora" : `Há ${diffHours} horas`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `Há ${diffDays} dias`;

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function mapNotificationDtoToItem(dto: NotificationDto): NotificationItem {
  const mod = notificationTypeToMod(dto.type);
  return {
    id: dto.id,
    icon: notificationModIcon(mod),
    mod,
    title: dto.title,
    text: dto.body,
    time: formatRelativeTime(dto.createdAt),
    dateTime: dto.createdAt,
    href: dto.href ?? "/notificacoes",
  };
}

export function matchesNotificationFilter(item: NotificationItem, filter: NotificationFilter): boolean {
  return filter === "all" || item.mod === filter;
}

export const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;
export const NOTIFICATIONS_UNREAD_QUERY_KEY = ["notifications", "unread-count"] as const;
