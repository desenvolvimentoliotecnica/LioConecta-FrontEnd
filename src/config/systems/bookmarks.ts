import type { BookmarkItem } from "../bookmarks";
import type { PortalSystemDto } from "../../api/types";

const SYSTEMS_HUB_PATH = "/servicos/acesso-sistemas";

export const SYSTEM_BOOKMARK_PREFIX = "system:";

export function systemBookmarkId(slug: string) {
  return `${SYSTEM_BOOKMARK_PREFIX}${slug}`;
}

export function isSystemBookmarkId(id: string) {
  return id.startsWith(SYSTEM_BOOKMARK_PREFIX);
}

function formatBookmarkDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function systemBookmarkItems(
  systems: PortalSystemDto[],
  savedIds: Set<string>,
): BookmarkItem[] {
  return systems
    .filter((system) => savedIds.has(systemBookmarkId(system.slug)))
    .map((system) => {
      const href =
        system.destinationType === "Internal" && system.launchUrl
          ? system.launchUrl
          : SYSTEMS_HUB_PATH;

      return {
        id: systemBookmarkId(system.slug),
        kind: "servico",
        title: system.name,
        excerpt: system.description?.trim() || "Sistema corporativo no hub de acesso.",
        href,
        icon: system.iconKind === "Upload" ? "fa-table-cells" : (system.iconFaClass ?? "fa-table-cells"),
        savedAt: formatBookmarkDate(system.updatedAt),
        savedDateTime: system.updatedAt,
        source: `Serviços · ${system.category}`,
      };
    });
}
