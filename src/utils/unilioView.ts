import { isAdminUser, hasRole } from "../api/auth";
import type { MeDto } from "../api/types";
import { PERSONA_LABELS } from "../config/unilio/constants";
import type { UniLioMetaView, UniLioPersonaContext } from "../config/unilio/types";

const INSTRUCTOR_EMAILS = new Set([
  "maria.silva@liotecnica.com.br",
  "natalia.rocha@liotecnica.com.br",
]);

export function resolveUniLioPersona(me?: MeDto | null, meta?: UniLioMetaView): UniLioPersonaContext {
  const serverPersona = meta?.persona ?? "learner";

  if (me && (isAdminUser(me) || hasRole(me, "HR"))) {
    return { persona: "admin", label: PERSONA_LABELS.admin, readOnly: false };
  }

  if (serverPersona === "instructor" || (me?.email && INSTRUCTOR_EMAILS.has(me.email.toLowerCase()))) {
    return { persona: "instructor", label: PERSONA_LABELS.instructor, readOnly: false };
  }

  if (serverPersona === "manager" || hasRole(me ?? undefined, "Manager")) {
    return { persona: "manager", label: PERSONA_LABELS.manager, readOnly: false };
  }

  if (serverPersona === "admin") {
    return { persona: "admin", label: PERSONA_LABELS.admin, readOnly: false };
  }

  return { persona: "learner", label: PERSONA_LABELS.learner, readOnly: false };
}

export function formatUniLioDate(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(dateStr));
}

export function formatUniLioDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(dateStr));
}

export function formatUniLioDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function formatUniLioRating(rating: number): string {
  return rating.toFixed(1);
}
