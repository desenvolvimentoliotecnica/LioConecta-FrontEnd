import type { DailyMenuDto, MenuSectionDto } from "../../api/types";
import { DAY_LABELS, LUNCH_SECTIONS, parseDateKey } from "../../config/facilities/menu";

type CardapioWeekGridProps = {
  days: DailyMenuDto[];
  canEdit: boolean;
  onCellChange: (date: string, sectionKey: string, value: string) => void;
  onApplyRowToWeek: (sectionKey: string, value: string) => void;
  onToggleHoliday: (date: string) => void;
};

function getSectionValue(day: DailyMenuDto, sectionKey: string): string {
  const lunch = day.meals.find((meal) => meal.mealType === "lunch");
  return lunch?.sections.find((section) => section.key === sectionKey)?.value ?? "";
}

function dayShortLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  const weekday = DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1];
  const label = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${weekday}\n${label}`;
}

export function CardapioWeekGrid({
  days,
  canEdit,
  onCellChange,
  onApplyRowToWeek,
  onToggleHoliday,
}: CardapioWeekGridProps) {
  return (
    <div className="cardapio-grid-wrap">
      <table className="cardapio-grid">
        <thead>
          <tr>
            <th scope="col" className="cardapio-grid__corner">
              Refeição / Dia
            </th>
            {days.map((day) => (
              <th
                key={day.date}
                scope="col"
                className={`cardapio-grid__day${day.dayStatus === "holiday" ? " cardapio-grid__day--holiday" : ""}`}
              >
                <span className="cardapio-grid__day-label">{dayShortLabel(day.date).replace("\n", " ")}</span>
                {canEdit ? (
                  <button
                    type="button"
                    className="cardapio-grid__holiday-btn"
                    title="Marcar/desmarcar feriado"
                    onClick={() => onToggleHoliday(day.date)}
                  >
                    {day.dayStatus === "holiday" ? "Feriado ✓" : "Feriado"}
                  </button>
                ) : day.dayStatus === "holiday" ? (
                  <span className="cardapio-grid__holiday-badge">{day.dayStatusLabel ?? "Feriado"}</span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {LUNCH_SECTIONS.map((section) => (
            <Row
              key={section.key}
              section={section}
              days={days}
              canEdit={canEdit}
              getValue={(day) => getSectionValue(day, section.key)}
              onCellChange={(date, value) => onCellChange(date, section.key, value)}
              onApplyRow={() => {
                const firstValue = days.map((day) => getSectionValue(day, section.key)).find((v) => v.trim()) ?? "";
                if (firstValue.trim()) onApplyRowToWeek(section.key, firstValue);
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({
  section,
  days,
  canEdit,
  getValue,
  onCellChange,
  onApplyRow,
}: {
  section: { key: string; label: string };
  days: DailyMenuDto[];
  canEdit: boolean;
  getValue: (day: DailyMenuDto) => string;
  onCellChange: (date: string, value: string) => void;
  onApplyRow: () => void;
}) {
  return (
    <tr>
      <th scope="row" className="cardapio-grid__row-label">
        <span>{section.label}</span>
        {canEdit ? (
          <button type="button" className="cardapio-grid__apply-row" onClick={onApplyRow} title="Aplicar à semana">
            Aplicar à semana
          </button>
        ) : null}
      </th>
      {days.map((day) => {
        const value = getValue(day);
        const isHoliday = day.dayStatus === "holiday";

        return (
          <td
            key={`${day.date}-${section.key}`}
            className={`cardapio-grid__cell${isHoliday ? " cardapio-grid__cell--holiday" : ""}${!value.trim() ? " cardapio-grid__cell--empty" : ""}`}
          >
            {canEdit ? (
              <textarea
                className="cardapio-grid__input"
                rows={2}
                value={value}
                aria-label={`${section.label} — ${day.date}`}
                onChange={(event) => onCellChange(day.date, event.target.value)}
              />
            ) : value.trim() ? (
              <span>{value}</span>
            ) : (
              <span className="cardapio-grid__dash">—</span>
            )}
          </td>
        );
      })}
    </tr>
  );
}

export function updateDaySection(
  day: DailyMenuDto,
  sectionKey: string,
  value: string,
): DailyMenuDto {
  const meals = day.meals.map((meal) => {
    if (meal.mealType !== "lunch") return meal;
    const sections: MenuSectionDto[] = meal.sections.map((section) =>
      section.key === sectionKey ? { ...section, value } : section,
    );
    if (!sections.some((section) => section.key === sectionKey)) {
      const template = LUNCH_SECTIONS.find((item) => item.key === sectionKey);
      if (template) sections.push({ ...template, value });
    }
    return { ...meal, sections };
  });

  if (!meals.some((meal) => meal.mealType === "lunch")) {
    meals.unshift({
      mealType: "lunch",
      sections: LUNCH_SECTIONS.map((item) => ({
        ...item,
        value: item.key === sectionKey ? value : "",
      })),
    });
  }

  return { ...day, meals };
}

export function applySectionToWeek(days: DailyMenuDto[], sectionKey: string, value: string): DailyMenuDto[] {
  return days.map((day) => updateDaySection(day, sectionKey, value));
}

export function toggleDayHoliday(day: DailyMenuDto): DailyMenuDto {
  const isHoliday = day.dayStatus === "holiday";
  return {
    ...day,
    dayStatus: isHoliday ? "normal" : "holiday",
    dayStatusLabel: isHoliday ? null : "Feriado",
    meals: isHoliday
      ? day.meals
      : day.meals.map((meal) =>
          meal.mealType === "lunch"
            ? {
                ...meal,
                sections: meal.sections.map((section) =>
                  section.key === "light" ? { ...section, value: "Feriado" } : section,
                ),
              }
            : meal,
        ),
  };
}
