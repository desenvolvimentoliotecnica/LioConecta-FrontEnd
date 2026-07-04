import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  comunicadosLinks,
  documentosLinks,
  FEED_PATH,
  gruposLinks,
  isDropdownActive,
  isPessoasSectionActive,
  pessoasLinks,
  servicosHeadings,
  tiLinks,
  allServicosLinks,
} from "../../config/navigation";
import { closeOtherMenus } from "./NotificationsMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";
import { useMenuCloseSync } from "./NotificationsMenu";

function Dropdown({
  label,
  menuId,
  items,
  services,
}: {
  label: string;
  menuId: string;
  items: { label: string; path: string }[];
  services?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useMenuCloseSync(setOpen, "dropdown");

  const active =
    label === "Pessoas"
      ? isPessoasSectionActive(location.pathname)
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
          closeOtherMenus("dropdown");
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
            {items.slice(0, 6).map((item) => (
              <NavLink key={item.path} to={item.path} role="menuitem" className={({ isActive }) => (isActive ? "is-active" : undefined)} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <span className={`topbar__menu-heading ${servicosHeadings[1].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[1].icon}`} aria-hidden="true" /> {servicosHeadings[1].label}
            </span>
            {items.slice(6, 8).map((item) => (
              <NavLink key={item.path} to={item.path} role="menuitem" className={({ isActive }) => (isActive ? "is-active" : undefined)} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <span className={`topbar__menu-heading ${servicosHeadings[2].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[2].icon}`} aria-hidden="true" /> {servicosHeadings[2].label}
            </span>
            {tiLinks.map((item) => (
              <NavLink key={item.path} to={item.path} role="menuitem" className={({ isActive }) => (isActive ? "is-active" : undefined)} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <span className={`topbar__menu-heading ${servicosHeadings[3].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[3].icon}`} aria-hidden="true" /> {servicosHeadings[3].label}
            </span>
            <a href="#" role="menuitem">Reservas de salas</a>
            <a href="#" role="menuitem">Reserva de veículos</a>
            <a href="#" role="menuitem">Crachá e visitantes</a>
            <a href="#" role="menuitem">Encomendas e correios</a>
            <span className={`topbar__menu-heading ${servicosHeadings[4].className}`} role="presentation">
              <i className={`fa-solid ${servicosHeadings[4].icon}`} aria-hidden="true" /> {servicosHeadings[4].label}
            </span>
            <a href="#" role="menuitem">Declarações e certidões</a>
            <a href="#" role="menuitem">Assinatura digital</a>
            <a href="#" role="menuitem">Seguro de vida</a>
            <a href="#" role="menuitem">Canal de denúncias</a>
          </>
        ) : (
          items.map((item) =>
            item.path === "#" ? (
              <a key={item.label} href="#" role="menuitem">
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                role="menuitem"
                className={({ isActive }) => (isActive ? "is-active" : undefined)}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            )
          )
        )}
      </div>
    </div>
  );
}

export function Topbar() {
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
          <NavLink to={FEED_PATH} end className={({ isActive }) => (isActive ? "is-active" : undefined)}>
            Feed
          </NavLink>
          <Dropdown label="Comunicados" menuId="menu-comunicados" items={comunicadosLinks} />
          <Dropdown label="Pessoas" menuId="menu-pessoas" items={pessoasLinks} />
          <Dropdown label="Grupos" menuId="menu-grupos" items={gruposLinks} />
          <Dropdown label="Documentos" menuId="menu-documentos" items={documentosLinks} />
          <Dropdown label="Serviços" menuId="menu-servicos" items={allServicosLinks} services />
        </nav>
      </div>

      <div className="search">
        <div className="search__field">
          <span className="search__icon" aria-hidden="true">
            <i className="fa-solid fa-magnifying-glass" />
          </span>
          Buscar pessoas, grupos, documentos e mais...
        </div>
      </div>

      <div className="topbar__actions">
        <NotificationsMenu />
        <div className="icon-btn-wrap" data-badge="2">
          <button className="topbar-icon-btn" type="button" aria-label="Mensagens">
            <i className="fa-regular fa-comment" aria-hidden="true" />
          </button>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
