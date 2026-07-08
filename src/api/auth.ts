import type { MeDto, UserRole } from "./types";
import type { CompassSettings } from "../config/compass/settings";
import type { LoopSettings } from "../config/loop/settings";

const ROLE_INDEX: Record<UserRole, number> = {
  Employee: 0,
  Manager: 1,
  HR: 2,
  TI: 3,
  Facilities: 4,
  Legal: 5,
  Admin: 6,
  AnalyticsViewer: 7,
  KioskReader: 8,
};

export function hasRole(me: MeDto | undefined, role: UserRole): boolean {
  if (!me) return false;
  const index = ROLE_INDEX[role];
  return me.roles.some((value: UserRole | number) => value === role || value === index);
}

export function isAdminUser(me: MeDto | undefined): boolean {
  return hasRole(me, "Admin");
}

/** Alinhado à policy RequireAdmin do backend (Admin ou AnalyticsViewer). */
export function canAccessAdminArea(me: MeDto | undefined): boolean {
  return hasRole(me, "Admin") || hasRole(me, "AnalyticsViewer");
}

/** Gestor / RH / Admin — gestão de férias (allow-list por e-mail resolve no backend). */
export function canAccessLeaveManagement(me: MeDto | undefined): boolean {
  return hasRole(me, "Admin") || hasRole(me, "HR") || hasRole(me, "Manager");
}

export function canAccessLoopModule(me: MeDto | undefined, settings: LoopSettings | undefined): boolean {
  if (!me || !settings?.enabled) return false;
  if (settings.allowedEmails.some((email) => email.toLowerCase() === me.email.toLowerCase())) {
    return true;
  }
  return settings.allowedRoles.some((role) => hasRole(me, role));
}

export function canAccessCompassModule(me: MeDto | undefined, settings: CompassSettings | undefined): boolean {
  if (!me || !settings?.enabled) return false;
  if (settings.allowedEmails.some((email) => email.toLowerCase() === me.email.toLowerCase())) {
    return true;
  }
  return settings.allowedRoles.some((role) => hasRole(me, role));
}
