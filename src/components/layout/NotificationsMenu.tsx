import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../../api/hooks/useNotifications";
import { mapNotificationDtoToItem } from "../../utils/notifications";

type MenuApi = { closeAll: (except: Element | null) => void };

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notificationsPage } = useNotifications(20);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const recent = useMemo(
    () => (notificationsPage?.items ?? []).slice(0, 3).map(mapNotificationDtoToItem),
    [notificationsPage?.items]
  );

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

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleMarkItemRead = (id: string) => {
    markRead.mutate(id);
  };

  const badge = unreadCount > 0 ? unreadCount : undefined;

  return (
    <div
      className={`notifications-menu icon-btn-wrap${open ? " is-open" : ""}`}
      data-badge={badge}
      ref={ref}
    >
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
          {unreadCount > 0 ? (
            <button className="notifications-menu__mark-read" type="button" onClick={handleMarkAllRead}>
              Marcar todas como lidas
            </button>
          ) : null}
        </div>
        {recent.length > 0 ? (
          <ul className="notifications-menu__list">
            {recent.map((item) => {
              const dto = notificationsPage?.items.find((entry) => entry.id === item.id);
              const unread = dto ? !dto.isRead : false;
              return (
                <li
                  key={item.id}
                  className={`notifications-menu__item${unread ? " notifications-menu__item--unread" : ""}`}
                >
                  <Link
                    className="notifications-menu__link"
                    to={item.href}
                    onClick={() => {
                      if (unread) handleMarkItemRead(item.id);
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
              );
            })}
          </ul>
        ) : (
          <p className="notifications-menu__empty">Nenhuma notificação recente.</p>
        )}
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
