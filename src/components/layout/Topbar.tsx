import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { usePortalUiSettings } from "../../api/hooks/usePortalUiSettings";
import { MATURITY_META, getPageMaturity } from "../../config/page-maturity";
import type { NavLinkItem } from "../../config/navigation";
import {
  comunicadosLinks,
  documentosLinks,
  FEED_PATH,
  gruposLinks,
  isComunicadosSectionActive,
  isDropdownActive,
  isDocumentosSectionActive,
  isGruposSectionActive,
  isPessoasSectionActive,
  pessoasLinks,
  servicosHeadings,
  tiLinks,
  facilitiesLinks,
  juridicoLinks,
  allServicosLinks,
} from "../../config/navigation";
import { MessagesTrigger } from "../chat/ChatWidget";
import { closeOtherMenus } from "./NotificationsMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { useMenuCloseSync } from "./NotificationsMenu";

function MaturityBadge({ path }: { path: string }) {
  const meta = MATURITY_META[getPageMaturity(path)];
  return <span className={`topbar__maturity-badge ${meta.className}`}>{meta.label}</span>;
}

function MenuItemLink({
  item,
  showBadges,
  onNavigate,
}: {
  item: NavLinkItem;
  showBadges: boolean;
  onNavigate: () => void;
}) {
  const content = (
    <>
      <span className="topbar__menu-label">{item.label}</span>
      {showBadges ? <MaturityBadge path={item.path} /> : null}
    </>
  );

  if (item.path === "#") {
    return (
      <a href="#" role="menuitem" className="topbar__menu-item">
        {content}
      </a>
    );
  }

  return (
    <NavLink
      to={item.path}
      role="menuitem"
      className={({ isActive }) => `topbar__menu-item${isActive ? " is-active" : ""}`}
      onClick={onNavigate}
    >
      {content}
    </NavLink>
  );
}

function Dropdown({
  label,
  menuId,
  items,
  services,
  showBadges,
}: {
  label: string;
  menuId: string;
  items: NavLinkItem[];
  services?: boolean;
  showBadges: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useMenuCloseSync(setOpen, menuId);

  const active =
    label === "Comunicados"
      ? isComunicadosSectionActive(location.pathname)
      : label === "Pessoas"
        ? isPessoasSectionActive(location.pathname)
        : label === "Documentos"
          ? isDocumentosSectionActive(location.pathname)
          : label === "Grupos"
            ? isGruposSectionActive(location.pathname)
            : isDropdownActive(location.pathname, items);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const close = () => setOpen(false);

  return (
    <div className={`topbar__dropdown${open ? " is-open" : ""}`} ref={ref}>
      <button
        className={`topbar__dropdown-trigger${active ? " is-active" : ""}`}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={(e) => {
          e.stopPropagation();
          closeOtherMenus(menuId);
          setOpen((v) => !v);
        }}
      >
        {label}
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </button>
      <div
        className={`topbar__dropdown-menu${services ? " topbar__dropdown-menu--services" : ""}`}
        id={menuId}
        role="menu"
      >
        {services ? (
          <>
            <span className={`topbar__menu-heading ${servicosHeadings[0].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[0].icon}`} aria-hidden="true" /> {servicosHeadings[0].label}
            </span>
            {items.slice(0, 7).map((item) => (
              <MenuItemLink key={item.path} item={item} showBadges={showBadges} onNavigate={close} />
            ))}
            <span className={`topbar__menu-heading ${servicosHeadings[1].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[1].icon}`} aria-hidden="true" /> {servicosHeadings[1].label}
            </span>
            {items.slice(7, 9).map((item) => (
              <MenuItemLink key={item.path} item={item} showBadges={showBadges} onNavigate={close} />
            ))}
            <span className={`topbar__menu-heading ${servicosHeadings[2].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[2].icon}`} aria-hidden="true" /> {servicosHeadings[2].label}
            </span>
            {tiLinks.map((item) => (
              <MenuItemLink key={item.path} item={item} showBadges={showBadges} onNavigate={close} />
            ))}
            <span className={`topbar__menu-heading ${servicosHeadings[3].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[3].icon}`} aria-hidden="true" /> {servicosHeadings[3].label}
            </span>
            {facilitiesLinks.map((item) => (
              <MenuItemLink key={item.path} item={item} showBadges={showBadges} onNavigate={close} />
            ))}
            <span className={`topbar__menu-heading ${servicosHeadings[4].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[4].icon}`} aria-hidden="true" /> {servicosHeadings[4].label}
            </span>
            {juridicoLinks.map((item) => (
              <MenuItemLink key={item.path} item={item} showBadges={showBadges} onNavigate={close} />
            ))}
          </>
        ) : (
          items.map((item) => (
            <MenuItemLink key={`${item.path}-${item.label}`} item={item} showBadges={showBadges} onNavigate={close} />
          ))
        )}
      </div>
    </div>
  );
}

export function Topbar() {
  const { data: portalUi } = usePortalUiSettings();
  const showBadges = portalUi.maturityBadgesEnabled;

  return (
    <header className="topbar" aria-label="Barra superior">
      <div className="topbar__brand">
        <Link className="logo" to={FEED_PATH} style={{ textDecoration: "none", color: "inherit" }}>
          <div className="logo__mark">
            <img src="/logo-lioconecta.png" alt="LioConecta" />
          </div>
          <div className="logo__text">LioConecta</div>
        </Link>
        <nav className="topbar__menu" aria-label="Menu principal">
          <NavLink
            to={FEED_PATH}
            end
            className={({ isActive }) => `topbar__menu-item topbar__menu-item--feed${isActive ? " is-active" : ""}`}
          >
            <span className="topbar__menu-label">Feed</span>
          </NavLink>
          <Dropdown label="Comunicados" menuId="menu-comunicados" items={comunicadosLinks} showBadges={showBadges} />
          <Dropdown label="Pessoas" menuId="menu-pessoas" items={pessoasLinks} showBadges={showBadges} />
          <Dropdown label="Grupos" menuId="menu-grupos" items={gruposLinks} showBadges={showBadges} />
          <Dropdown label="Documentos" menuId="menu-documentos" items={documentosLinks} showBadges={showBadges} />
          <Dropdown label="Serviços" menuId="menu-servicos" items={allServicosLinks} services showBadges={showBadges} />
        </nav>
      </div>

      <div className="search">
        <label className="search__field">
          <span className="search__icon" aria-hidden="true">
            <i className="fa-solid fa-magnifying-glass" />
          </span>
          <input
            type="search"
            className="search__input"
            placeholder="Buscar pessoas, grupos, documentos..."
            aria-label="Buscar pessoas, grupos, documentos e mais"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
      </div>

      <div className="topbar__actions">
        <NotificationsMenu />
        <MessagesTrigger />
        <UserMenu />
      </div>
    </header>
  );
}
