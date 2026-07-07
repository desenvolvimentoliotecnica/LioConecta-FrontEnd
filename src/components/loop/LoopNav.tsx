import { NavLink } from "react-router-dom";
import { LOOP_NAV_ITEMS } from "../../config/loop/navigation";

type LoopNavProps = {
  collapsed: boolean;
  onToggle: () => void;
  pendingApprovals?: number;
};

export function LoopNav({ collapsed, onToggle, pendingApprovals = 0 }: LoopNavProps) {
  return (
    <nav className={`loop-nav${collapsed ? " loop-nav--collapsed" : ""}`} aria-label="Menu do Loop">
      <button
        type="button"
        className="loop-nav__toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expandir menu Loop" : "Recolher menu Loop"}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>

      <div className="loop-nav__brand">
        <i className="fa-solid fa-infinity loop-nav__brand-icon" aria-hidden="true" />
        {!collapsed ? <span className="loop-nav__brand-text">Loop</span> : null}
      </div>

      <ul className="loop-nav__list">
        {LOOP_NAV_ITEMS.map((item) => {
          const badge =
            item.id === "approvals" && pendingApprovals > 0 ? pendingApprovals : item.badge;
          return (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === "/loop"}
                className={({ isActive }) => `loop-nav__item${isActive ? " is-active" : ""}`}
                title={item.label}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                {!collapsed ? <span className="loop-nav__label">{item.label}</span> : null}
                {badge ? <span className="loop-nav__badge">{badge}</span> : null}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
