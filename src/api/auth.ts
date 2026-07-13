import type { DataScope, EffectivePermissionDto, MeDto, UserRole } from "./types";
import { servicosLinks } from "../config/navigation";
import {
  PERMISSIONS,
  RBAC_ADMIN_PERMISSIONS as RBAC_ADMIN_PERMISSION_KEYS,
} from "../config/rbac/permissions";



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



const DATA_SCOPE_INDEX: Record<string, number> = {

  Self: 0,

  Team: 1,

  Department: 2,

  Global: 3,

};



function normalizeScope(scope: DataScope): number {

  if (typeof scope === "number") return scope;

  return DATA_SCOPE_INDEX[scope] ?? -1;

}



function findPermission(me: MeDto | undefined, key: string): EffectivePermissionDto | undefined {

  return me?.permissions?.find((permission) => permission.key === key);

}



/** @deprecated Prefer `hasPermission` during RBAC migration. Kept for legacy role checks. */

export function hasRole(me: MeDto | undefined, role: UserRole): boolean {

  if (!me) return false;

  const index = ROLE_INDEX[role];

  return me.roles.some((value: UserRole | number) => value === role || value === index);

}



export function getPermissionScope(me: MeDto | undefined, key: string): DataScope | undefined {

  return findPermission(me, key)?.scope;

}



export function hasPermission(me: MeDto | undefined, key: string, requiredScope?: DataScope): boolean {

  const permission = findPermission(me, key);

  if (!permission) return false;

  if (requiredScope === undefined) return true;

  return normalizeScope(permission.scope) === normalizeScope(requiredScope);

}



export function hasAnyPermission(me: MeDto | undefined, keys: readonly string[]): boolean {

  return keys.some((key) => hasPermission(me, key));

}



export function isAdminUser(me: MeDto | undefined): boolean {

  return hasPermission(me, PERMISSIONS.admin.settingsManage) || hasRole(me, "Admin");

}



/** @deprecated Prefer `hasAnyPermission` with specific admin keys. */

export function canAccessAdminArea(me: MeDto | undefined): boolean {

  if (!me) return false;

  return hasAnyPermission(me, [

    PERMISSIONS.admin.settingsManage,

    PERMISSIONS.analytics.view,

    ...RBAC_ADMIN_PERMISSION_KEYS,

    PERMISSIONS.admin.workersManage,

    PERMISSIONS.admin.emailManage,

    PERMISSIONS.admin.totvsManage,

  ]);

}



export function canAccessRbacAdmin(me: MeDto | undefined): boolean {

  if (!me) return false;

  if (hasAnyPermission(me, RBAC_ADMIN_PERMISSION_KEYS)) return true;

  return hasRole(me, "Admin");

}



/** Gestão de férias: alinhado ao backend (`leave.manage` / `leave.approve`). Admin sozinho não libera. */
export function canAccessLeaveManagement(me: MeDto | undefined): boolean {
  return (
    hasPermission(me, PERMISSIONS.leave.manage) ||
    hasPermission(me, PERMISSIONS.leave.approve)
  );
}

/** Fila de solicitações RH (benefícios/contracheque): `rh_requests.manage`. */
export function canAccessRhRequestsManagement(me: MeDto | undefined): boolean {
  return hasPermission(me, PERMISSIONS.rhRequests.manage);
}

/** Gestão de ponto: alinhado ao backend (`ponto.manage` / `ponto.approve`). */
export function canAccessPontoManagement(me: MeDto | undefined): boolean {
  return (
    hasPermission(me, PERMISSIONS.ponto.manage) ||
    hasPermission(me, PERMISSIONS.ponto.approve)
  );
}

/** Aprovação de grupos: alinhado ao backend (`groups.approve`). */
export function canAccessGroupApprovals(me: MeDto | undefined): boolean {
  return hasPermission(me, PERMISSIONS.groups.approve);
}

/** Nav `permission` field: string = required key; array = OR. */
export function canAccessNavPermission(
  me: MeDto | undefined,
  permission?: string | readonly string[],
): boolean {
  if (!permission) return true;
  if (typeof permission === "string") return hasPermission(me, permission);
  return hasAnyPermission(me, permission);
}

/** Serviços Topbar/hub: flags *Only + campo `permission`. */
export function canAccessServicosNavItem(
  me: MeDto | undefined,
  item: {
    benefitsManageOnly?: boolean;
    leaveManageOnly?: boolean;
    pontoManageOnly?: boolean;
    payslipsAuditOnly?: boolean;
    permission?: string | readonly string[];
  },
): boolean {
  if (item.benefitsManageOnly && !hasPermission(me, PERMISSIONS.benefits.manage)) return false;
  if (
    item.leaveManageOnly &&
    !hasPermission(me, PERMISSIONS.leave.manage) &&
    !hasPermission(me, PERMISSIONS.leave.approve)
  ) {
    return false;
  }
  if (
    item.pontoManageOnly &&
    !hasPermission(me, PERMISSIONS.ponto.manage) &&
    !hasPermission(me, PERMISSIONS.ponto.approve)
  ) {
    return false;
  }
  if (item.payslipsAuditOnly && !hasPermission(me, PERMISSIONS.payslips.audit)) return false;
  return canAccessNavPermission(me, item.permission);
}

/** Lookup permission requirement for a Serviços path (sitemap / busca / deep link). */
export function getServicosNavPermission(path: string): string | readonly string[] | undefined {
  return servicosLinks.find((item) => item.path === path)?.permission;
}

export function canAccessServicosPath(me: MeDto | undefined, path: string): boolean {
  const item = servicosLinks.find((link) => link.path === path);
  if (!item) return true;
  return canAccessServicosNavItem(me, item);
}

export function canAccessLoopModule(

  me: MeDto | undefined,

  settings: import("../config/loop/settings").LoopSettings | undefined,

): boolean {

  if (!hasPermission(me, PERMISSIONS.loop.access)) return false;

  return settings?.enabled !== false;

}



export function canAccessPulseModule(

  me: MeDto | undefined,

  settings: import("../config/loop/settings").LoopSettings | undefined,

): boolean {

  if (hasPermission(me, PERMISSIONS.pulse.access)) return true;

  return canAccessLoopModule(me, settings);

}



export function canAccessCompassModule(

  me: MeDto | undefined,

  settings: import("../config/compass/settings").CompassSettings | undefined,

): boolean {

  if (!hasPermission(me, PERMISSIONS.compass.access)) return false;

  return settings?.enabled !== false;

}



export function canAccessUniLioModule(

  me: MeDto | undefined,

  settings: import("../config/unilio/settings").UniLioSettings | undefined,

): boolean {

  if (!hasPermission(me, PERMISSIONS.unilio.access)) return false;

  return settings?.enabled !== false;

}



export { PERMISSIONS, RBAC_ADMIN_PERMISSION_KEYS as RBAC_ADMIN_PERMISSIONS };

