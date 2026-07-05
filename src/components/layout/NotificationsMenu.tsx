import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRecentNotifications } from "../../config/notifications";

type MenuApi = { closeAll: (except: Element | null) => void };

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState(3);
  const recent = getRecentNotifications(3);
  const [unread, setUnread] = useState(() => recent.map((item) => item.id));
  const ref = useRef<HTMLDivElement>(null);

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

  const markAllRead = () => {
    setUnread([]);
    setBadge(0);
  };

  const markItemRead = (id: string) => {
    setUnread((prev) => {
      const next = prev.filter((itemId) => itemId !== id);
      setBadge(next.length);
      return next;
    });
  };

  return (
    <div className={`notifications-menu icon-btn-wrap${open ? " is-open" : ""}`} data-badge={badge} ref={ref}>
      <button
        className="topbar-icon-btn notifications-menu__trigger"
        type="button"
        aria-label="Notificações"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="notifications-panel"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
          window.dispatchEvent(new CustomEvent("lio:close-menus", { detail: { except: "notifications" } }));
        }}
      >
        <i className="fa-regular fa-bell" aria-hidden="true" />
      </button>
      <div
        className="notifications-menu__panel"
        id="notifications-panel"
        role="region"
        aria-label="Notificações recentes"
      >
        <div className="notifications-menu__header">
          <span className="notifications-menu__title">Notificações</span>
          <button className="notifications-menu__mark-read" type="button" onClick={markAllRead}>
            Marcar todas como lidas
          </button>
        </div>
        <ul className="notifications-menu__list">
          {recent.map((item) => (
            <li
              key={item.id}
              className={`notifications-menu__item${unread.includes(item.id) ? " notifications-menu__item--unread" : ""}`}
            >
              <Link
                className="notifications-menu__link"
                to={item.href}
                onClick={() => {
                  markItemRead(item.id);
                  setOpen(false);
                }}
              >
                <span className={`notifications-menu__icon notifications-menu__icon--${item.mod}`}>
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                </span>
                <div className="notifications-menu__body">
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                  <time dateTime={item.dateTime}>{item.time}</time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <Link className="notifications-menu__footer" to="/notificacoes" onClick={() => setOpen(false)}>
          Ver todas as notificações
        </Link>
      </div>
    </div>
  );
}

export function useMenuCloseSync(setOpen: (v: boolean) => void, id: string) {
  useEffect(() => {
    function onClose(e: Event) {
      const detail = (e as CustomEvent<{ except?: string }>).detail;
      if (detail?.except !== id) setOpen(false);
    }
    window.addEventListener("lio:close-menus", onClose);
    return () => window.removeEventListener("lio:close-menus", onClose);
  }, [setOpen, id]);
}

export function closeOtherMenus(except: string) {
  window.dispatchEvent(new CustomEvent("lio:close-menus", { detail: { except } }));
}

declare global {
  interface Window {
    LioNotifications?: MenuApi;
  }
}
