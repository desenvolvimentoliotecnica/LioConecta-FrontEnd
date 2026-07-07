import type { UpdateAppSettingRequest } from "../api/types";
import { flattenAppSettingsMap } from "./loop/settings";
import {
  TOPBAR_NAV_ITEMS,
  getPageMaturity,
  isMaturityDone,
  roadmapIdForPath,
} from "./page-maturity";

export type MaturityRoadmapItem = {
  id: string;
  label: string;
  path?: string;
  status: "done" | "pending";
  notes?: string;
};

export type PortalUiSettings = {
  maturityBadgesEnabled: boolean;
  roadmap: MaturityRoadmapItem[];
};

export const PORTAL_UI_SETTINGS_STORAGE_KEY = "lioconecta.portal.ui.settings";

export const PORTAL_UI_SETTING_KEYS = {
  maturityBadgesEnabled: "portal.ui.maturity_badges_enabled",
  maturityRoadmap: "portal.ui.maturity_roadmap",
} as const;

export const DEFAULT_PORTAL_UI_SETTINGS: PortalUiSettings = {
  maturityBadgesEnabled: false,
  roadmap: buildDefaultRoadmap(),
};

export function buildDefaultRoadmap(): MaturityRoadmapItem[] {
  return TOPBAR_NAV_ITEMS.map((item) => {
    const maturity = getPageMaturity(item.path);
    return {
      id: roadmapIdForPath(item.path, item.label),
      label: item.label,
      path: item.path === "#" ? undefined : item.path,
      status: isMaturityDone(maturity) ? "done" : "pending",
    };
  });
}

function normalizeRoadmapItem(raw: unknown): MaturityRoadmapItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Partial<MaturityRoadmapItem>;
  if (typeof item.id !== "string" || typeof item.label !== "string") return null;
  if (item.status !== "done" && item.status !== "pending") return null;

  return {
    id: item.id,
    label: item.label,
    path: typeof item.path === "string" ? item.path : undefined,
    status: item.status,
    notes: typeof item.notes === "string" ? item.notes : undefined,
  };
}

export function parseRoadmap(raw: string | null | undefined): MaturityRoadmapItem[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    const items = parsed.map(normalizeRoadmapItem).filter((item): item is MaturityRoadmapItem => item !== null);
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export function portalUiSettingsToAppSettings(settings: PortalUiSettings): UpdateAppSettingRequest[] {
  return [
    {
      key: PORTAL_UI_SETTING_KEYS.maturityBadgesEnabled,
      value: settings.maturityBadgesEnabled ? "true" : "false",
    },
    {
      key: PORTAL_UI_SETTING_KEYS.maturityRoadmap,
      value: JSON.stringify(settings.roadmap),
    },
  ];
}

export function parsePortalUiSettings(raw: string | null | undefined): PortalUiSettings {
  if (!raw?.trim()) return DEFAULT_PORTAL_UI_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<PortalUiSettings>;
    return {
      maturityBadgesEnabled: parsed.maturityBadgesEnabled ?? DEFAULT_PORTAL_UI_SETTINGS.maturityBadgesEnabled,
      roadmap: Array.isArray(parsed.roadmap)
        ? parsed.roadmap.map(normalizeRoadmapItem).filter((item): item is MaturityRoadmapItem => item !== null)
        : DEFAULT_PORTAL_UI_SETTINGS.roadmap,
    };
  } catch {
    return DEFAULT_PORTAL_UI_SETTINGS;
  }
}

export function readPortalUiSettingsFromStorage(): PortalUiSettings {
  if (typeof window === "undefined") return DEFAULT_PORTAL_UI_SETTINGS;
  return parsePortalUiSettings(localStorage.getItem(PORTAL_UI_SETTINGS_STORAGE_KEY));
}

export function writePortalUiSettingsToStorage(settings: PortalUiSettings): void {
  localStorage.setItem(PORTAL_UI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function portalUiSettingsFingerprint(settings: PortalUiSettings): string {
  return JSON.stringify({
    maturityBadgesEnabled: settings.maturityBadgesEnabled,
    roadmap: settings.roadmap,
  });
}

export function portalUiSettingsPresentInMap(map: Record<string, string>): boolean {
  return Object.values(PORTAL_UI_SETTING_KEYS).some((key) => key in map);
}

export function parsePortalUiSettingsFromAppSettings(
  settings: Record<string, string> | undefined,
  fallbackToStorage = true,
): PortalUiSettings {
  if (!settings || !portalUiSettingsPresentInMap(settings)) {
    return fallbackToStorage ? readPortalUiSettingsFromStorage() : DEFAULT_PORTAL_UI_SETTINGS;
  }

  const roadmapFromDb = parseRoadmap(settings[PORTAL_UI_SETTING_KEYS.maturityRoadmap]);

  return {
    maturityBadgesEnabled: settings[PORTAL_UI_SETTING_KEYS.maturityBadgesEnabled] === "true",
    roadmap: roadmapFromDb ?? buildDefaultRoadmap(),
  };
}

export function resolvePortalUiSettingsFromSources(
  map: Record<string, string>,
  fallback: PortalUiSettings,
): PortalUiSettings {
  if (!portalUiSettingsPresentInMap(map)) {
    return fallback;
  }

  return parsePortalUiSettingsFromAppSettings(map, false);
}

export function portalUiSettingsPresentInCategories(
  categories: { settings: { key: string; value: string }[] }[],
): boolean {
  return portalUiSettingsPresentInMap(flattenAppSettingsMap(categories));
}
