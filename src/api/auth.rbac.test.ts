import { describe, expect, it } from "vitest";
import {
  canAccessCompassModule,
  canAccessLoopModule,
  canAccessPulseModule,
  canAccessUniLioModule,
  hasAnyPermission,
  hasPermission,
} from "./auth";
import type { MeDto } from "./types";
import { PERMISSIONS } from "../config/rbac/permissions";

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
    expect(canAccessCompassModule(me, { enabled: true, allowedRoles: [], allowedEmails: [] })).toBe(true);
    expect(canAccessCompassModule(me, { enabled: false, allowedRoles: [], allowedEmails: [] })).toBe(false);
  });

  it("requires unilio permission and enabled flag", () => {
    const me = meWithPermissions([PERMISSIONS.unilio.access]);
    expect(canAccessUniLioModule(me, { enabled: true, allowedRoles: [], allowedEmails: [] })).toBe(true);
    expect(canAccessUniLioModule(me, { enabled: false, allowedRoles: [], allowedEmails: [] })).toBe(false);
  });
});
