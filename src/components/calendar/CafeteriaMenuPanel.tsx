import { Link } from "react-router-dom";
import type { DailyMenuDto } from "../../api/types";
import { formatDisplayDate } from "../../config/facilities/menu";
import { getPublishedLunchSections, hasMenuContent, menuDayHeadline } from "./cafeteriaMenuDisplay";

type CafeteriaMenuPanelProps = {
  date: string;
  menu: DailyMenuDto | null | undefined;
};

export function CafeteriaMenuPanel({ date, menu }: CafeteriaMenuPanelProps) {
  const sections = getPublishedLunchSections(menu);
  const headline = menuDayHeadline(menu);
  const hasContent = hasMenuContent(menu);

  return (
    <section className="calendar-panel calendar-panel--menu" aria-label="Cardápio do dia">
      <div className="calendar-menu__header">
        <div>
          <h2 className="calendar-panel__title">Cardápio do dia</h2>
          <p className="calendar-menu__meta">{formatDisplayDate(date)}</p>
        </div>
        <Link className="calendar-menu__link" to="/servicos/cardapio">
          Ver semana
          <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
        </Link>
      </div>

      {headline ? (
        <p className={`calendar-menu__holiday${menu?.dayStatus === "holiday" ? " calendar-menu__holiday--festive" : ""}`}>
          {headline}
        </p>
      ) : null}

      {hasContent && sections.length > 0 ? (
        <ul className="calendar-menu">
          {sections.map((section) => (
            <li key={section.key} className="calendar-menu__item">
              <div className="calendar-menu__content">
                <span className="calendar-menu__category">{section.label}</span>
                <strong className="calendar-menu__name">{section.value}</strong>
              </div>
            </li>
          ))}
        </ul>
      ) : hasContent && headline ? null : (
        <p className="calendar-panel__empty">Cardápio não disponível para esta data.</p>
      )}
    </section>
  );
}
