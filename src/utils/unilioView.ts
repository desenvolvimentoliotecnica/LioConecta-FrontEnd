import { hasAnyPermission, hasPermission } from "../api/auth";
import type { MeDto } from "../api/types";
import { PERSONA_LABELS } from "../config/unilio/constants";
import type { UniLioMetaView, UniLioPersonaContext } from "../config/unilio/types";

const ADMIN_PERMISSIONS = [
  "unilio.courses.approve",
  "unilio.courses.publish",
  "unilio.compliance.manage",
  "unilio.paths.manage",
  "unilio.skills.manage",
] as const;

const INSTRUCTOR_PERMISSIONS = [
  "unilio.instructor.panel",
  "unilio.courses.author",
  "unilio.courses.edit.own",
] as const;

export function resolveUniLioPersona(me?: MeDto | null, meta?: UniLioMetaView): UniLioPersonaContext {
  if (me && hasAnyPermission(me, ADMIN_PERMISSIONS)) {
    return { persona: "admin", label: PERSONA_LABELS.admin, readOnly: false };
  }

  if (me && hasAnyPermission(me, INSTRUCTOR_PERMISSIONS)) {
    return { persona: "instructor", label: PERSONA_LABELS.instructor, readOnly: false };
  }

  if (me && hasPermission(me, "unilio.team.view")) {
    return { persona: "manager", label: PERSONA_LABELS.manager, readOnly: false };
  }

  const serverPersona = meta?.persona ?? "learner";
  if (serverPersona === "admin") {
    return { persona: "admin", label: PERSONA_LABELS.admin, readOnly: false };
  }
  if (serverPersona === "instructor") {
    return { persona: "instructor", label: PERSONA_LABELS.instructor, readOnly: false };
  }
  if (serverPersona === "manager") {
    return { persona: "manager", label: PERSONA_LABELS.manager, readOnly: false };
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
