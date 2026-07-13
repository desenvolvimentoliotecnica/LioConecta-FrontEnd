import type { HelpDeskAreaDto } from "../../api/types";

const AREA_ICONS: Record<string, string> = {
  laptop: "fa-solid fa-laptop",
  money: "fa-solid fa-sack-dollar",
  clipboard: "fa-solid fa-clipboard-list",
  folder: "fa-solid fa-folder",
};

export function getAreaIconClass(icon: string): string {
  return AREA_ICONS[icon] ?? AREA_ICONS.folder;
}

export function findAreaById(areas: HelpDeskAreaDto[], areaId: string): HelpDeskAreaDto | undefined {
  return areas.find((item) => item.id === areaId);
}

/** Resolve a entidade GLPI preferida para acesso a sistemas (ex-ID fictício "ti"). */
export function resolveSystemsAccessArea(areas: HelpDeskAreaDto[]): HelpDeskAreaDto | null {
  if (areas.length === 0) return null;

  const byEntityId = areas.find((item) => item.entityId === 1);
  if (byEntityId) return byEntityId;

  const byName = areas.find((item) => {
    const normalized = item.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    return /\bti\b/.test(normalized) || normalized.includes("tecnolog") || normalized.includes("infra");
  });
  if (byName) return byName;

  return areas[0] ?? null;
}

export function formatAreaServiceCount(count: number): string {
  return `${count} serviço${count === 1 ? "" : "s"}`;
}
