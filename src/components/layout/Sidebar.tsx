import { Link } from "react-router-dom";
import { canAccessAdminArea } from "../../api/auth";
import { useMe } from "../../api/hooks/useMe";

type SidebarItemConfig = {
  label: string;
  href: string;
  icon: string;
  activePrefix?: string;
  activeOn?: readonly string[];
  spacerBefore?: boolean;
  adminOnly?: boolean;
};

const LEFT_ITEMS: SidebarItemConfig[] = [
  { label: "Início", icon: "fa-house", href: "/", activeOn: ["/"] },
  { label: "Feed", icon: "fa-rss", href: "/" },
  { label: "Pessoas", icon: "fa-users", href: "/pessoas", activePrefix: "/pessoas" },
  { label: "Grupos", icon: "fa-people-group", href: "/grupos", activePrefix: "/grupos" },
  { label: "Calendário", icon: "fa-calendar-days", href: "/calendario" },
  { label: "Documentos", icon: "fa-folder-open", href: "/documentos", activePrefix: "/documentos" },
];

const RIGHT_ITEMS: SidebarItemConfig[] = [
  { label: "Minhas atividades", icon: "fa-list-check", href: "/minhas-atividades" },
  { label: "Analytics", icon: "fa-chart-pie", href: "/analytics" },
  {
    label: "Config. Backend",
    icon: "fa-server",
    href: "/admin/configuracoes-backend",
    activePrefix: "/admin/configuracoes-backend",
    spacerBefore: true,
    adminOnly: true,
  },
  {
    label: "Trilha de auditoria",
    icon: "fa-clipboard-list",
    href: "/admin/trilha-auditoria",
    activePrefix: "/admin/trilha-auditoria",
    adminOnly: true,
  },
  {
    label: "Observabilidade",
    icon: "fa-chart-line",
    href: "/admin/observabilidade",
    activePrefix: "/admin/observabilidade",
    adminOnly: true,
  },
  { label: "Ajuda", icon: "fa-circle-question", href: "/ajuda" },
  { label: "Mapa do site", icon: "fa-sitemap", href: "/mapa-do-site" },
  { label: "Favoritos", icon: "fa-star", href: "/favoritos" },
  { label: "Bookmarks", icon: "fa-bookmark", href: "/bookmarks" },
  { label: "Atalhos", icon: "fa-bolt", href: "/atalhos", spacerBefore: true },
  { label: "Quiosque", icon: "fa-tablet-screen-button", href: "/quiosque", spacerBefore: true },
];

type SidebarProps = {
  side: "left" | "right";
  expanded: boolean;
  onToggle: () => void;
  activePath?: string;
};

function SidebarIcon({ icon }: { icon: string }) {
  return (
    <span className="sidebar__fa-icon" aria-hidden="true">
      <i className={`fa-solid ${icon}`} />
    </span>
  );
}

function SidebarItem({ label, icon, href }: SidebarItemConfig) {
  if (href === "#") {
    return (
      <a className="sidebar__item" href="#" title={label}>
        <SidebarIcon icon={icon} />
        <span className="sidebar__text">{label}</span>
      </a>
    );
  }
  return (
    <Link className="sidebar__item" to={href} title={label}>
      <SidebarIcon icon={icon} />
      <span className="sidebar__text">{label}</span>
    </Link>
  );
}

export function Sidebar({ side, expanded, onToggle, activePath = "/" }: SidebarProps) {
  const { data: me } = useMe();
  const canAccessAdmin = canAccessAdminArea(me);
  const baseItems = side === "left" ? LEFT_ITEMS : RIGHT_ITEMS;
  const items =
    side === "right"
      ? baseItems.filter((item) => !item.adminOnly || canAccessAdmin)
      : baseItems;
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
          <i className="fa-solid fa-chevron-right" />
        </span>
        <span className="sidebar__toggle-label">Recolher</span>
      </button>
      {items.map((item, idx) => {
        const isHomeActive =
          side === "left" && idx === 0 && (activePath === "/" || activePath === "");
        const isRouteActive =
          item.href !== "#" &&
          (activePath === item.href ||
            (item.activePrefix &&
              (activePath === item.activePrefix || activePath.startsWith(`${item.activePrefix}/`))));
        const isActive = isHomeActive || isRouteActive;
        return (
          <span key={item.label}>
            {item.spacerBefore ? <div className="sidebar__spacer" /> : null}
            {isActive ? (
              <Link className="sidebar__item is-active" to={item.href} title={item.label}>
                <SidebarIcon icon={item.icon} />
                <span className="sidebar__text">{item.label}</span>
              </Link>
            ) : (
              <SidebarItem {...item} />
            )}
          </span>
        );
      })}
      {side === "left" ? (
        <>
          <div className="sidebar__spacer" />
          <a className="sidebar__item" href="#" title="Configurações">
            <SidebarIcon icon="fa-gear" />
            <span className="sidebar__text">Configurações</span>
          </a>
        </>
      ) : null}
    </aside>
  );
}
