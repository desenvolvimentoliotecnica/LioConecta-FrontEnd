import type { DailyMenuDto } from "../../api/types";
import { formatDisplayDate, getFilledSections, getLunchSections } from "../../config/facilities/menu";

type CardapioDayCardsProps = {
  days: DailyMenuDto[];
};

export function CardapioDayCards({ days }: CardapioDayCardsProps) {
  return (
    <div className="cardapio-day-cards">
      {days.map((day) => {
        const sections = getFilledSections(getLunchSections(day));
        const isHoliday = day.dayStatus === "holiday";

        return (
          <article
            key={day.date}
            className={`cardapio-day-card${isHoliday ? " cardapio-day-card--holiday" : ""}`}
          >
            <header className="cardapio-day-card__head">
              <h3 className="cardapio-day-card__title">{formatDisplayDate(day.date)}</h3>
              {isHoliday ? (
                <span className="cardapio-day-card__badge">{day.dayStatusLabel ?? "Feriado"}</span>
              ) : null}
            </header>
            {sections.length > 0 ? (
              <dl className="cardapio-day-card__list">
                {sections.map((section) => (
                  <div key={section.key} className="cardapio-day-card__item">
                    <dt>{section.label}</dt>
                    <dd>{section.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="cardapio-day-card__empty">Sem cardápio publicado.</p>
            )}
          </article>
        );
      })}
    </div>
  );
}
