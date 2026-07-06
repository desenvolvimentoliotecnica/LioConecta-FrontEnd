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

export function formatAreaServiceCount(count: number): string {
  return `${count} serviço${count === 1 ? "" : "s"}`;
}
