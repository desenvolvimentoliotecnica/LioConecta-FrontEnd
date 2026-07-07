import { describe, expect, it } from "vitest";
import type { DailyMenuDto } from "../../api/types";
import {
  getPublishedLunchSections,
  hasMenuContent,
  menuDayHeadline,
} from "./cafeteriaMenuDisplay";

const sampleMenu: DailyMenuDto = {
  date: "2026-07-07",
  dayStatus: "normal",
  dayStatusLabel: null,
  meals: [
    {
      mealType: "lunch",
      sections: [
        { key: "entrada", label: "Entrada (Sopas)", value: "Creme de tomate" },
        { key: "main_1", label: "Prato principal 1", value: "Frango grelhado" },
        { key: "gourmet", label: "Espaço Gourmet", value: "" },
      ],
    },
  ],
  notes: null,
  published: true,
};

describe("cafeteriaMenuDisplay", () => {
  it("returns only filled lunch sections when published", () => {
    const sections = getPublishedLunchSections(sampleMenu);
    expect(sections).toHaveLength(2);
    expect(sections[0]?.key).toBe("entrada");
  });

  it("detects menu content", () => {
    expect(hasMenuContent(sampleMenu)).toBe(true);
    expect(hasMenuContent({ ...sampleMenu, published: false })).toBe(false);
  });

  it("returns holiday headline", () => {
    const holiday: DailyMenuDto = {
      ...sampleMenu,
      dayStatus: "holiday",
      dayStatusLabel: "Feriado",
    };
    expect(menuDayHeadline(holiday)).toBe("Feriado");
  });
});
