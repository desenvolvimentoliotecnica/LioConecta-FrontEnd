import { describe, expect, it } from "vitest";
import {
  canAccessCompassModule,
  canAccessLoopModule,
  canAccessPulseModule,
  canAccessServicosPath,
  canAccessUniLioModule,
  hasAnyPermission,
  hasPermission,
} from "./auth";
import type { MeDto } from "./types";
import { PERMISSIONS } from "../config/rbac/permissions";
import { DEFAULT_COMPASS_SETTINGS } from "../config/compass/settings";

function meWithPermissions(keys: string[]): MeDto {
  return {
    id: "test-user",
    slug: "test-user",
    name: "Test User",
    email: "test@example.com",
    roles: ["Employee"],
    permissions: keys.map((key) => ({ key, scope: "Global" as const })),
  };
}

describe("RBAC auth helpers", () => {
  it("grants permission when key is present on me", () => {
    const me = meWithPermissions([PERMISSIONS.benefits.manage]);
    expect(hasPermission(me, PERMISSIONS.benefits.manage)).toBe(true);
    expect(hasPermission(me, PERMISSIONS.systems.manage)).toBe(false);
  });

  it("checks any-of permission lists", () => {
    const me = meWithPermissions([PERMISSIONS.analytics.view]);
    expect(hasAnyPermission(me, [PERMISSIONS.admin.settingsManage, PERMISSIONS.analytics.view])).toBe(
      true,
    );
  });

  it("requires module permission and enabled flag for loop access", () => {
    const me = meWithPermissions([PERMISSIONS.loop.access]);
    expect(canAccessLoopModule(me, { enabled: true, allowedRoles: [], allowedEmails: [] })).toBe(true);
    expect(canAccessLoopModule(me, { enabled: false, allowedRoles: [], allowedEmails: [] })).toBe(false);
    expect(canAccessLoopModule(meWithPermissions([]), { enabled: true, allowedRoles: [], allowedEmails: [] })).toBe(
      false,
    );
  });

  it("allows pulse via pulse.access or loop.access", () => {
    const loopOnly = meWithPermissions([PERMISSIONS.loop.access]);
    const pulseOnly = meWithPermissions([PERMISSIONS.pulse.access]);
    const settings = { enabled: true, allowedRoles: [], allowedEmails: [] };

    expect(canAccessPulseModule(pulseOnly, settings)).toBe(true);
    expect(canAccessPulseModule(loopOnly, settings)).toBe(true);
    expect(canAccessPulseModule(meWithPermissions([]), settings)).toBe(false);
  });

  it("requires compass permission and enabled flag", () => {
    const me = meWithPermissions([PERMISSIONS.compass.access]);
    expect(canAccessCompassModule(me, { ...DEFAULT_COMPASS_SETTINGS, enabled: true })).toBe(true);
    expect(canAccessCompassModule(me, { ...DEFAULT_COMPASS_SETTINGS, enabled: false })).toBe(false);
  });

  it("requires unilio permission and enabled flag", () => {
    const me = meWithPermissions([PERMISSIONS.unilio.access]);
    expect(canAccessUniLioModule(me, { enabled: true, allowedRoles: [], allowedEmails: [] })).toBe(true);
    expect(canAccessUniLioModule(me, { enabled: false, allowedRoles: [], allowedEmails: [] })).toBe(false);
  });

  describe("financeiro / transport nav gate", () => {
    const vt = "/servicos/vale-transporte";
    const reembolso = "/servicos/reembolso-despesas";
    const adiantamento = "/servicos/adiantamento-viagem";

    it("hides all three from employee without grants", () => {
      const employee = meWithPermissions([]);
      expect(canAccessServicosPath(employee, vt)).toBe(false);
      expect(canAccessServicosPath(employee, reembolso)).toBe(false);
      expect(canAccessServicosPath(employee, adiantamento)).toBe(false);
    });

    it("HR with transport.manage sees only vale-transporte", () => {
      const hr = meWithPermissions([PERMISSIONS.transport.manage]);
      expect(canAccessServicosPath(hr, vt)).toBe(true);
      expect(canAccessServicosPath(hr, reembolso)).toBe(false);
      expect(canAccessServicosPath(hr, adiantamento)).toBe(false);
    });

    it("KeyUser-Financeiro manage sees reembolso and adiantamento", () => {
      const fin = meWithPermissions([
        PERMISSIONS.reimbursement.manage,
        PERMISSIONS.travelAdvance.manage,
      ]);
      expect(canAccessServicosPath(fin, vt)).toBe(false);
      expect(canAccessServicosPath(fin, reembolso)).toBe(true);
      expect(canAccessServicosPath(fin, adiantamento)).toBe(true);
    });

    it("manual .read grant unlocks a single menu", () => {
      const pilot = meWithPermissions([PERMISSIONS.reimbursement.read]);
      expect(canAccessServicosPath(pilot, reembolso)).toBe(true);
      expect(canAccessServicosPath(pilot, adiantamento)).toBe(false);
    });
  });
});
