import { describe, expect, it } from "vitest";
import type { DailyMenuDto } from "../../api/types";
import { createEmptyDailyMenu } from "../../config/facilities/menu";
import { applySectionToWeek, toggleDayHoliday, updateDaySection } from "./CardapioWeekGrid";

describe("CardapioWeekGrid helpers", () => {
  it("updates a section value for one day", () => {
    const day = createEmptyDailyMenu("2026-07-07");
    const updated = updateDaySection(day, "farofa", "Farofa Qualimax - Picanha");
    const lunch = updated.meals.find((meal) => meal.mealType === "lunch");
    expect(lunch?.sections.find((section) => section.key === "farofa")?.value).toBe(
      "Farofa Qualimax - Picanha",
    );
  });

  it("applies a section value to all days in the week", () => {
    const days: DailyMenuDto[] = ["2026-07-06", "2026-07-07"].map((date) => createEmptyDailyMenu(date));
    const updated = applySectionToWeek(days, "farofa", "Farofa Qualimax - Picanha");
    expect(updated.every((day) => updateDaySection(day, "farofa", "").meals[0]?.sections.some((s) => s.key === "farofa"))).toBe(true);
    expect(
      updated.every(
        (day) =>
          day.meals[0]?.sections.find((section) => section.key === "farofa")?.value ===
          "Farofa Qualimax - Picanha",
      ),
    ).toBe(true);
  });

  it("marks a day as holiday and sets light option", () => {
    const day = createEmptyDailyMenu("2026-07-09");
    const holiday = toggleDayHoliday(day);
    expect(holiday.dayStatus).toBe("holiday");
    expect(holiday.meals[0]?.sections.find((section) => section.key === "light")?.value).toBe("Feriado");
  });
});
