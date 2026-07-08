import { NavLink } from "react-router-dom";
import { COMPASS_NAV_ITEMS } from "../../config/compass/navigation";

type CompassNavProps = {
  collapsed: boolean;
  onToggle: () => void;
  criticalGaps?: number;
  upcomingMeetings?: number;
};

export function CompassNav({
  collapsed,
  onToggle,
  criticalGaps = 0,
  upcomingMeetings = 0,
}: CompassNavProps) {
  return (
    <nav className={`compass-nav${collapsed ? " compass-nav--collapsed" : ""}`} aria-label="Menu do Compass">
      <button
        type="button"
        className="compass-nav__toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expandir menu Compass" : "Recolher menu Compass"}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>

      <div className="compass-nav__brand">
        <i className="fa-solid fa-compass compass-nav__brand-icon" aria-hidden="true" />
        {!collapsed ? <span className="compass-nav__brand-text">Compass</span> : null}
      </div>

      <ul className="compass-nav__list">
        {COMPASS_NAV_ITEMS.map((item) => {
          let badge = item.badge;
          if (item.id === "reconciliacao" && criticalGaps > 0) badge = criticalGaps;
          if (item.id === "reunioes" && upcomingMeetings > 0) badge = upcomingMeetings;

          return (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === "/compass"}
                className={({ isActive }) => `compass-nav__item${isActive ? " is-active" : ""}`}
                title={item.label}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                {!collapsed ? <span className="compass-nav__label">{item.label}</span> : null}
                {badge ? <span className="compass-nav__badge">{badge}</span> : null}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
