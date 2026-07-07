import { NavLink } from "react-router-dom";
import { PULSE_NAV_ITEMS } from "../../config/pulse/navigation";

type PulseNavProps = {
  collapsed: boolean;
  onToggle: () => void;
  openImpediments?: number;
};

export function PulseNav({ collapsed, onToggle, openImpediments = 0 }: PulseNavProps) {
  return (
    <nav className={`pulse-nav${collapsed ? " pulse-nav--collapsed" : ""}`} aria-label="Menu do Pulse">
      <button
        type="button"
        className="pulse-nav__toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expandir menu Pulse" : "Recolher menu Pulse"}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>

      <div className="pulse-nav__brand">
        <i className="fa-solid fa-heart-pulse pulse-nav__brand-icon" aria-hidden="true" />
        {!collapsed ? <span className="pulse-nav__brand-text">Pulse</span> : null}
      </div>

      <ul className="pulse-nav__list">
        {PULSE_NAV_ITEMS.map((item) => {
          const badge =
            item.id === "impediments" && openImpediments > 0 ? openImpediments : item.badge;
          return (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === "/pulse"}
                className={({ isActive }) => `pulse-nav__item${isActive ? " is-active" : ""}`}
                title={item.label}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                {!collapsed ? <span className="pulse-nav__label">{item.label}</span> : null}
                {badge ? <span className="pulse-nav__badge">{badge}</span> : null}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
