import type { MeDto, UserRole } from "./types";

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
