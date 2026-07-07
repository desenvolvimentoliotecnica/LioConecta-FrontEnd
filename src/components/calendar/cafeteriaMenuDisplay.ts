import type { DailyMenuDto, MenuSectionDto } from "../../api/types";
import { getFilledSections, getLunchSections } from "../../config/facilities/menu";

export function getPublishedLunchSections(menu: DailyMenuDto | null | undefined): MenuSectionDto[] {
  if (!menu?.published) return [];
  return getFilledSections(getLunchSections(menu));
}

export function hasMenuContent(menu: DailyMenuDto | null | undefined): boolean {
  if (!menu?.published) return false;
  if (menu.dayStatus === "holiday" || menu.dayStatus === "closed") return true;
  return getPublishedLunchSections(menu).length > 0;
}

export function menuDayHeadline(menu: DailyMenuDto | null | undefined): string | null {
  if (!menu) return null;
  if (menu.dayStatus === "holiday") return menu.dayStatusLabel ?? "Feriado";
  if (menu.dayStatus === "closed") return menu.dayStatusLabel ?? "Refeitório fechado";
  return null;
}
