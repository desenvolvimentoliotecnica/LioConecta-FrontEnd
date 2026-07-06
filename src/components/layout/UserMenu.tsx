import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "../../api/hooks/useAuth";
import { useMe } from "../../api/hooks/useMe";
import { closeOtherMenus, useMenuCloseSync } from "./NotificationsMenu";

const FALLBACK = {
  slug: "leonardo-mendes",
  name: "Leonardo Sabino Mendes",
  photoUrl: "/avatar-carlos-mendes.png",
};

export function UserMenu() {
  const { data: me } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const user = me ?? FALLBACK;
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
    new URLSearchParams(location.search).get("id") === user.slug;

  const avatarSrc = user.photoUrl?.startsWith("/")
    ? user.photoUrl
    : user.photoUrl ?? FALLBACK.photoUrl;

  return (
    <div className={`user-menu${open ? " is-open" : ""}`} ref={ref}>
      <button
        className="user-menu__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="user-menu-panel"
        aria-label={`Perfil de ${user.name}`}
        onClick={(e) => {
          e.stopPropagation();
          closeOtherMenus("user");
          setOpen((v) => !v);
        }}
      >
        <img className="avatar" src={avatarSrc} alt="" />
        <span className="user-menu__name" title={user.name}>
          {user.name}
        </span>
        <span className="user-menu__chevron" aria-hidden="true">
          <i className="fa-solid fa-chevron-down" />
        </span>
      </button>
      <div className="user-menu__panel" id="user-menu-panel" role="menu">
        <Link
          to={{ pathname: "/pessoas/perfil", search: `id=${encodeURIComponent(user.slug)}` }}
          role="menuitem"
          className={profileActive ? "is-active" : undefined}
          onClick={() => setOpen(false)}
        >
          <i className="fa-regular fa-user" aria-hidden="true" /> Ver perfil completo
        </Link>
        <a href="#" role="menuitem" onClick={() => setOpen(false)}>
          <i className="fa-solid fa-gear" aria-hidden="true" /> Configurações
        </a>
        <button
          type="button"
          role="menuitem"
          className="user-menu__logout"
          disabled={logout.isPending}
          onClick={() => {
            setOpen(false);
            logout.mutate(undefined, {
              onSettled: () => navigate("/acesso", { replace: true }),
            });
          }}
        >
          <i className="fa-solid fa-right-from-bracket" aria-hidden="true" /> Sair
        </button>
      </div>
    </div>
  );
}
