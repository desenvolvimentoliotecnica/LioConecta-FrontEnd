import { Link, NavLink } from "react-router-dom";
import { filterNavItemsForPersona } from "../../config/unilio/navigation";
import type { UniLioPersona } from "../../config/unilio/types";

type UniLioNavProps = {
  collapsed: boolean;
  onToggle: () => void;
  persona: UniLioPersona;
  complianceBadge?: number;
  minimal?: boolean;
};

export function UniLioNav({
  collapsed,
  onToggle,
  persona,
  complianceBadge = 0,
  minimal = false,
}: UniLioNavProps) {
  const items = filterNavItemsForPersona(persona);

  if (minimal) {
    return (
      <nav className="unilio-nav unilio-nav--minimal" aria-label="Atalhos do curso">
        <Link to="/unilio/catalogo" className="unilio-nav__item unilio-nav__exit" title="Voltar ao catálogo">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </Link>
        <Link to="/unilio" className="unilio-nav__brand unilio-nav__brand--minimal" title="UniLio">
          <i className="fa-solid fa-graduation-cap unilio-nav__brand-icon" aria-hidden="true" />
        </Link>
      </nav>
    );
  }

  return (
    <nav className={`unilio-nav${collapsed ? " unilio-nav--collapsed" : ""}`} aria-label="Menu do UniLio">
      <button
        type="button"
        className="unilio-nav__toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expandir menu UniLio" : "Recolher menu UniLio"}
      >
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>

      <div className="unilio-nav__brand">
        <i className="fa-solid fa-graduation-cap unilio-nav__brand-icon" aria-hidden="true" />
        {!collapsed ? <span className="unilio-nav__brand-text">UniLio</span> : null}
      </div>

      <ul className="unilio-nav__list">
        {items.map((item) => {
          let badge = item.badge;
          if (item.id === "compliance" && complianceBadge > 0) badge = complianceBadge;

          return (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === "/unilio"}
                className={({ isActive }) => `unilio-nav__item${isActive ? " is-active" : ""}`}
                title={item.label}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                {!collapsed ? <span className="unilio-nav__label">{item.label}</span> : null}
                {badge ? <span className="unilio-nav__badge">{badge}</span> : null}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
