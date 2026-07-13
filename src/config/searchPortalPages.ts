import {
  canAccessAdminArea,
  canAccessRbacAdmin,
  hasPermission,
} from "../api/auth";
import type { MeDto } from "../api/types";
import { PERMISSIONS } from "./rbac/permissions";
import { buildSitemapSections, type SitemapEntry } from "./sitemap";

export type PortalPageHit = {
  id: string;
  label: string;
  path: string;
  description?: string;
  sectionLabel: string;
};

function flattenSitemap(): PortalPageHit[] {
  const hits: PortalPageHit[] = [];
  for (const section of buildSitemapSections()) {
    const push = (entry: SitemapEntry) => {
      if (entry.disabled || entry.path === "#") return;
      hits.push({
        id: `${section.id}:${entry.path}`,
        label: entry.label,
        path: entry.path,
        description: entry.description,
        sectionLabel: section.label,
      });
    };
    for (const item of section.items ?? []) push(item);
    for (const sub of section.subsections ?? []) {
      for (const item of sub.items) push(item);
    }
  }
  return hits;
}

function canSeePath(path: string, me: MeDto | undefined | null): boolean {
  if (path.startsWith("/admin")) {
    return canAccessAdminArea(me ?? undefined) || canAccessRbacAdmin(me ?? undefined);
  }
  if (path.startsWith("/unilio")) return hasPermission(me ?? undefined, PERMISSIONS.unilio.access);
  if (path.startsWith("/loop")) return hasPermission(me ?? undefined, PERMISSIONS.loop.access);
  if (path.startsWith("/pulse")) {
    return (
      hasPermission(me ?? undefined, PERMISSIONS.pulse.access) ||
      hasPermission(me ?? undefined, PERMISSIONS.loop.access)
    );
  }
  if (path.startsWith("/compass")) return hasPermission(me ?? undefined, PERMISSIONS.compass.access);
  if (path.startsWith("/analytics")) return hasPermission(me ?? undefined, PERMISSIONS.analytics.view);
  if (path.includes("/feedback/triagem")) {
    return hasPermission(me ?? undefined, PERMISSIONS.feedback.triage);
  }
  if (path === "/feedback" || path.startsWith("/feedback/")) {
    return hasPermission(me ?? undefined, PERMISSIONS.feedback.submit);
  }
  return true;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function searchPortalPages(
  query: string,
  me: MeDto | undefined | null,
  limit = 20,
): PortalPageHit[] {
  const term = normalize(query.trim());
  if (term.length < 2) return [];

  return flattenSitemap()
    .filter((hit) => canSeePath(hit.path, me))
    .filter((hit) => {
      const haystack = normalize(
        `${hit.label} ${hit.path} ${hit.description ?? ""} ${hit.sectionLabel}`,
      );
      return haystack.includes(term);
    })
    .slice(0, limit);
}
