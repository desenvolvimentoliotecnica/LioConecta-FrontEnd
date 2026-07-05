import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../../api/hooks/useNotifications";
import { NOTIFICATION_FILTERS, type NotificationFilter } from "../../config/notifications";
import {
  mapNotificationDtoToItem,
  matchesNotificationFilter,
} from "../../utils/notifications";
import "../../styles/notifications-page.css";

export function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [query, setQuery] = useState("");
  const { data: notificationsPage, isLoading } = useNotifications(100);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = useMemo(
    () => (notificationsPage?.items ?? []).map(mapNotificationDtoToItem),
    [notificationsPage?.items]
  );

  const readById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const dto of notificationsPage?.items ?? []) {
      map.set(dto.id, dto.isRead);
    }
    return map;
  }, [notificationsPage?.items]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      if (!matchesNotificationFilter(item, filter)) return false;
      if (!normalized) return true;
      return (
        item.title.toLowerCase().includes(normalized) ||
        item.text.toLowerCase().includes(normalized)
      );
    });
  }, [filter, items, query]);

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const handleMarkItemRead = (id: string) => {
    if (!readById.get(id)) {
      markRead.mutate(id);
    }
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Notificações</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Notificações</h1>
            <p className="page-header__desc">
              Acompanhe comunicados, atualizações de RH, avisos de serviços e interações da sua rede interna em um só lugar.
            </p>
          </div>
          {unreadCount > 0 ? (
            <button className="notifications-page__mark-all" type="button" onClick={handleMarkAllRead}>
              Marcar todas como lidas
            </button>
          ) : null}
        </div>
      </header>

      <section className="notifications-page__controls" aria-label="Resumo e filtros">
        <div className="notifications-page__summary">
          <div className="notifications-page__summary-icon" aria-hidden="true">
            <i className="fa-regular fa-bell" />
          </div>
          <div>
            <div className="notifications-page__summary-title">
              {unreadCount > 0
                ? `${unreadCount} notificaç${unreadCount === 1 ? "ão" : "ões"} não lida${unreadCount === 1 ? "" : "s"}`
                : "Tudo em dia!"}
            </div>
            <p className="notifications-page__summary-text">
              {unreadCount > 0
                ? "Revise os avisos recentes abaixo ou filtre por categoria para encontrar o que precisa."
                : "Você leu todas as notificações recentes. Novos avisos aparecerão aqui automaticamente."}
            </p>
          </div>
        </div>

        <div className="notifications-page__toolbar">
          <div className="page-filters" role="group" aria-label="Filtrar notificações">
            {NOTIFICATION_FILTERS.map((entry) => (
              <button
                key={entry.id}
                className={`filter-chip${filter === entry.id ? " is-active" : ""}`}
                type="button"
                onClick={() => setFilter(entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>
          <label className="page-search notifications-page__search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar notificações..."
              aria-label="Buscar notificações"
            />
          </label>
        </div>
      </section>

      {isLoading ? (
        <div className="notifications-page__empty">
          <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
          <p>Carregando notificações...</p>
        </div>
      ) : filtered.length > 0 ? (
        <ul className="notifications-page__list" aria-label="Lista de notificações">
          {filtered.map((item) => {
            const unread = !readById.get(item.id);
            return (
              <li key={item.id}>
                <Link
                  className={`notifications-page__item${unread ? " notifications-page__item--unread" : ""}`}
                  to={item.href}
                  onClick={() => handleMarkItemRead(item.id)}
                >
                  <span className={`notifications-page__icon notifications-page__icon--${item.mod}`}>
                    <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                  </span>
                  <div className="notifications-page__body">
                    <div className="notifications-page__headline">
                      <strong>{item.title}</strong>
                      {unread ? <span className="notifications-page__badge">Nova</span> : null}
                    </div>
                    <p>{item.text}</p>
                    <time dateTime={item.dateTime}>{item.time}</time>
                  </div>
                  <i className="fa-solid fa-chevron-right notifications-page__chevron" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="notifications-page__empty">
          <i className="fa-regular fa-bell-slash" aria-hidden="true" />
          <p>Nenhuma notificação encontrada para os filtros selecionados.</p>
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} de {items.length} notificações
      </p>
    </main>
  );
}
