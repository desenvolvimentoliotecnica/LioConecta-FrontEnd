import { Link } from "react-router-dom";
import { canAccessLoopModule, canAccessCompassModule, canAccessPulseModule, canAccessUniLioModule, hasRole } from "../../api/auth";
import { useCompassSettings } from "../../api/hooks/useCompassSettings";
import { useLoopSettings } from "../../api/hooks/useLoopSettings";
import { useUniLioSettings } from "../../api/hooks/useUniLioSettings";
import { PERMISSIONS, RBAC_ADMIN_PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";

type ModuleGate = "loop" | "pulse" | "compass" | "unilio";

type SidebarItemConfig = {
  label: string;
  href: string;
  icon: string;
  activePrefix?: string;
  activeOn?: readonly string[];
  spacerBefore?: boolean;
  permission?: string | readonly string[];
  moduleGate?: ModuleGate;
  adminRoleOnly?: boolean;
};

const LEFT_ITEMS: SidebarItemConfig[] = [
  { label: "Início", icon: "fa-house", href: "/", activeOn: ["/"] },
  { label: "Feed", icon: "fa-rss", href: "/" },
  { label: "Pessoas", icon: "fa-users", href: "/pessoas", activePrefix: "/pessoas" },
  { label: "Grupos", icon: "fa-people-group", href: "/grupos", activePrefix: "/grupos" },
  { label: "Calendário", icon: "fa-calendar-days", href: "/calendario" },
  { label: "Documentos", icon: "fa-folder-open", href: "/documentos", activePrefix: "/documentos" },
  {
    label: "Sistemas",
    icon: "fa-border-all",
    href: "/servicos/acesso-sistemas",
    activePrefix: "/servicos/acesso-sistemas",
  },
  {
    label: "Loop",
    icon: "fa-infinity",
    href: "/loop",
    activePrefix: "/loop",
    permission: PERMISSIONS.loop.access,
    moduleGate: "loop",
  },
  {
    label: "Pulse",
    icon: "fa-heart-pulse",
    href: "/pulse",
    activePrefix: "/pulse",
    moduleGate: "pulse",
  },
  {
    label: "Compass",
    icon: "fa-compass",
    href: "/compass",
    activePrefix: "/compass",
    permission: PERMISSIONS.compass.access,
    moduleGate: "compass",
  },
  {
    label: "UniLio",
    icon: "fa-graduation-cap",
    href: "/unilio",
    activePrefix: "/unilio",
    permission: PERMISSIONS.unilio.access,
    moduleGate: "unilio",
  },
];

const RIGHT_ITEMS: SidebarItemConfig[] = [
  { label: "Minhas atividades", icon: "fa-list-check", href: "/minhas-atividades" },
  { label: "Analytics", icon: "fa-chart-pie", href: "/analytics", permission: PERMISSIONS.analytics.view },
  {
    label: "Config. Backend",
    icon: "fa-server",
    href: "/admin/configuracoes-backend",
    activePrefix: "/admin/configuracoes-backend",
    spacerBefore: true,
    permission: PERMISSIONS.admin.settingsManage,
  },
  {
    label: "Controle de acesso",
    icon: "fa-user-shield",
    href: "/admin/controle-acesso",
    activePrefix: "/admin/controle-acesso",
    permission: RBAC_ADMIN_PERMISSIONS,
  },
  {
    label: "Trilha de auditoria",
    icon: "fa-clipboard-list",
    href: "/admin/trilha-auditoria",
    activePrefix: "/admin/trilha-auditoria",
    permission: PERMISSIONS.analytics.view,
  },
  {
    label: "Observabilidade",
    icon: "fa-chart-line",
    href: "/admin/observabilidade",
    activePrefix: "/admin/observabilidade",
    permission: PERMISSIONS.analytics.view,
  },
  {
    label: "Workers",
    icon: "fa-gears",
    href: "/admin/workers",
    activePrefix: "/admin/workers",
    permission: PERMISSIONS.admin.workersManage,
  },
  {
    label: "DB Explorer",
    icon: "fa-database",
    href: "/admin/db-explorer",
    activePrefix: "/admin/db-explorer",
    adminRoleOnly: true,
  },
  {
    label: "E-mail",
    icon: "fa-envelope",
    href: "/admin/email",
    activePrefix: "/admin/email",
    permission: PERMISSIONS.admin.emailManage,
  },
  {
    label: "Organograma",
    icon: "fa-sitemap",
    href: "/admin/governanca/organograma",
    activePrefix: "/admin/governanca/organograma",
    permission: PERMISSIONS.admin.settingsManage,
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

function isSidebarItemActive(item: SidebarItemConfig, activePath: string): boolean {
  const path = activePath || "/";

  if (item.activeOn?.length) {
    return item.activeOn.some((p) => path === p || (p === "/" && path === ""));
  }

  if (item.activePrefix) {
    return path === item.activePrefix || path.startsWith(`${item.activePrefix}/`);
  }

  if (item.href === "#") return false;

  // "/" belongs to Início (activeOn); avoid marking Feed with the same href.
  if (item.href === "/") return false;

  return path === item.href;
}

function SidebarItem({
  label,
  icon,
  href,
  isActive = false,
}: SidebarItemConfig & { isActive?: boolean }) {
  const className = `sidebar__item${isActive ? " is-active" : ""}`;
  if (href === "#") {
    return (
      <a className={className} href="#" title={label}>
        <SidebarIcon icon={icon} />
        <span className="sidebar__text">{label}</span>
      </a>
    );
  }
  return (
    <Link className={className} to={href} title={label}>
      <SidebarIcon icon={icon} />
      <span className="sidebar__text">{label}</span>
    </Link>
  );
}

function isModuleGateOpen(
  gate: ModuleGate | undefined,
  me: ReturnType<typeof usePermissions>["me"],
  loopSettings: ReturnType<typeof useLoopSettings>["data"],
  compassSettings: ReturnType<typeof useCompassSettings>["data"],
  unilioSettings: ReturnType<typeof useUniLioSettings>["data"],
): boolean {
  if (!gate) return true;
  switch (gate) {
    case "loop":
      return canAccessLoopModule(me, loopSettings);
    case "pulse":
      return canAccessPulseModule(me, loopSettings);
    case "compass":
      return canAccessCompassModule(me, compassSettings);
    case "unilio":
      return canAccessUniLioModule(me, unilioSettings);
    default:
      return true;
  }
}

export function Sidebar({ side, expanded, onToggle, activePath = "/" }: SidebarProps) {
  const { me, hasPermission, hasAnyPermission } = usePermissions();
  const { data: loopSettings } = useLoopSettings();
  const { data: compassSettings } = useCompassSettings();
  const { data: unilioSettings } = useUniLioSettings();
  const baseItems = side === "left" ? LEFT_ITEMS : RIGHT_ITEMS;
  const items = baseItems.filter((item) => {
    if (item.adminRoleOnly && !hasRole(me, "Admin")) return false;
    if (item.permission) {
      const granted =
        typeof item.permission === "string"
          ? hasPermission(item.permission)
          : hasAnyPermission(item.permission);
      if (!granted) return false;
    }
    if (item.moduleGate) {
      return isModuleGateOpen(item.moduleGate, me, loopSettings, compassSettings, unilioSettings);
    }
    return true;
  });
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
      <nav className="sidebar__nav" aria-label={side === "left" ? "Navegação principal" : "Navegação secundária"}>
        {items.map((item) => {
          const isActive = isSidebarItemActive(item, activePath);
          return (
            <span key={item.label}>
              {item.spacerBefore ? <div className="sidebar__spacer" /> : null}
              <SidebarItem {...item} isActive={isActive} />
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
      </nav>
    </aside>
  );
}
