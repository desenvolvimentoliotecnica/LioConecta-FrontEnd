import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { closeOtherMenus, useMenuCloseSync } from "./NotificationsMenu";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  useMenuCloseSync(setOpen, "user");

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

  const profileActive =
    location.pathname === "/pessoas/perfil" &&
    new URLSearchParams(location.search).get("id") === "maria-silva";

  return (
    <div className={`user-menu${open ? " is-open" : ""}`} ref={ref}>
      <button
        className="user-menu__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="user-menu-panel"
        aria-label="Perfil de Maria Silva"
        onClick={(e) => {
          e.stopPropagation();
          closeOtherMenus("user");
          setOpen((v) => !v);
        }}
      >
        <img className="avatar" src="/avatar-maria-silva.png" alt="" />
        <span className="user-menu__name">Maria Silva</span>
        <span className="user-menu__chevron" aria-hidden="true">
          <i className="fa-solid fa-chevron-down" />
        </span>
      </button>
      <div className="user-menu__panel" id="user-menu-panel" role="menu">
        <Link
          to="/pessoas/perfil?id=maria-silva"
          role="menuitem"
          className={profileActive ? "is-active" : undefined}
          onClick={() => setOpen(false)}
        >
          <i className="fa-regular fa-user" aria-hidden="true" /> Ver perfil completo
        </Link>
        <a href="#" role="menuitem" onClick={() => setOpen(false)}>
          <i className="fa-solid fa-gear" aria-hidden="true" /> Configurações
        </a>
        <a href="#" role="menuitem" onClick={() => setOpen(false)}>
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sair
        </a>
      </div>
    </div>
  );
}
