import { Link } from "react-router-dom";

const LEFT_ITEMS = [
  { label: "Início", icon: "/icon-home.png", href: "/", activeOn: ["/"] },
  { label: "Feed", icon: "/icon-feed.png", href: "/" },
  { label: "Pessoas", icon: "/icon-people.png", href: "/pessoas/diretorio" },
  { label: "Grupos", icon: "/icon-groups.png", href: "/grupos/meus-grupos" },
  { label: "Calendário", icon: "/icon-calendar.png", href: "#" },
  { label: "Documentos", icon: "/icon-documents.png", href: "/documentos/politicas-internas" },
];

const RIGHT_ITEMS = [
  { label: "Analytics", icon: "/icon-analytics.png", href: "/analytics" },
  { label: "Ajuda", icon: "/icon-help.png", href: "#" },
  { label: "Favoritos", icon: "/icon-favorites.png", href: "#" },
  { label: "Bookmarks", icon: "/icon-bookmarks.png", href: "#" },
  { label: "Atalhos", icon: "/icon-shortcuts.png", href: "#", spacerBefore: true },
];

type SidebarProps = {
  side: "left" | "right";
  expanded: boolean;
  onToggle: () => void;
  activePath?: string;
};

function SidebarItem({ label, icon, href }: { label: string; icon: string; href: string }) {
  if (href === "#") {
    return (
      <a className="sidebar__item" href="#" title={label}>
        <img src={icon} alt="" />
        <span className="sidebar__text">{label}</span>
      </a>
    );
  }
  return (
    <Link className="sidebar__item" to={href} title={label}>
      <img src={icon} alt="" />
      <span className="sidebar__text">{label}</span>
    </Link>
  );
}

export function Sidebar({ side, expanded, onToggle, activePath = "/" }: SidebarProps) {
  const items = side === "left" ? LEFT_ITEMS : RIGHT_ITEMS;
  const id = side === "left" ? "sidebar-left" : "sidebar-right";

  return (
    <aside
      className={`sidebar sidebar--${side}${expanded ? " is-expanded" : ""}`}
      id={id}
      aria-label={side === "left" ? "Menu lateral esquerdo" : "Menu lateral direito"}
    >
      <button
        className="sidebar__toggle"
        type="button"
        aria-expanded={expanded}
        aria-controls={id}
        aria-label={expanded ? "Recolher menu lateral" : "Expandir menu lateral"}
        onClick={onToggle}
      >
        <span className="sidebar__toggle-icon" aria-hidden="true">
          <svg>
            <use href="#icon-chevron" />
          </svg>
        </span>
        <span className="sidebar__toggle-label">Recolher</span>
      </button>
      {items.map((item, idx) => {
        const isHomeActive =
          side === "left" && idx === 0 && (activePath === "/" || activePath === "");
        const isRouteActive = item.href !== "#" && activePath === item.href;
        const isActive = isHomeActive || isRouteActive;
        return (
          <span key={item.label}>
            {"spacerBefore" in item && item.spacerBefore ? <div className="sidebar__spacer" /> : null}
            {isActive ? (
              <Link className="sidebar__item is-active" to={item.href} title={item.label}>
                <img src={item.icon} alt="" />
                <span className="sidebar__text">{item.label}</span>
              </Link>
            ) : (
              <SidebarItem label={item.label} icon={item.icon} href={item.href} />
            )}
          </span>
        );
      })}
      {side === "left" ? (
        <>
          <div className="sidebar__spacer" />
          <a className="sidebar__item" href="#" title="Configurações">
            <img src="/icon-settings.png" alt="" />
            <span className="sidebar__text">Configurações</span>
          </a>
        </>
      ) : null}
    </aside>
  );
}

export function ChevronSymbol() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }} aria-hidden="true">
      <symbol id="icon-chevron" viewBox="0 0 24 24">
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
      </symbol>
    </svg>
  );
}
