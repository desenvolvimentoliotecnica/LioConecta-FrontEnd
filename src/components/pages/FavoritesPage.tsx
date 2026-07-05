import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FAVORITES,
  FAVORITE_FILTERS,
  filterFavorites,
  type FavoriteKind,
} from "../../config/favorites";
import "../../styles/hub-pages.css";

export function FavoritesPage() {
  const [kind, setKind] = useState<FavoriteKind>("all");
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(FAVORITES.map((item) => item.id)));

  const filtered = useMemo(
    () => filterFavorites(FAVORITES.filter((item) => favoriteIds.has(item.id)), kind, query),
    [kind, query, favoriteIds],
  );

  const removeFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Favoritos</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Favoritos</h1>
            <p className="page-header__desc">
              Pessoas, grupos, serviços e documentos que você usa com frequência — acesso rápido ao
              que importa no seu dia a dia.
            </p>
          </div>
        </div>
      </header>

      <section className="hub-page__controls hub-page__controls--favorites" aria-label="Filtros">
        <div className="hub-page__summary">
          <div className="hub-page__summary-icon hub-page__summary-icon--favorites" aria-hidden="true">
            <i className="fa-solid fa-star" />
          </div>
          <div>
            <div className="hub-page__summary-title">
              {favoriteIds.size} favorito{favoriteIds.size === 1 ? "" : "s"} fixado{favoriteIds.size === 1 ? "" : "s"}
            </div>
            <p className="hub-page__summary-text">
              Favoritos são entidades recorrentes: colegas, grupos, serviços e documentos de referência.
              Diferente de bookmarks, que guardam conteúdos específicos para consulta posterior.
            </p>
          </div>
        </div>

        <div className="hub-page__toolbar">
          <div className="page-filters" role="group" aria-label="Filtrar favoritos">
            {FAVORITE_FILTERS.map((entry) => (
              <button
                key={entry.id}
                className={`filter-chip${kind === entry.id ? " is-active" : ""}`}
                type="button"
                onClick={() => setKind(entry.id)}
              >
                <i className={`fa-solid ${entry.icon}`} aria-hidden="true" style={{ marginRight: 6 }} />
                {entry.label}
              </button>
            ))}
          </div>
          <label className="page-search hub-page__search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar favoritos..."
              aria-label="Buscar favoritos"
            />
          </label>
        </div>
      </section>

      {filtered.length > 0 ? (
        <ul className="hub-page__list hub-page__list--favorites" aria-label="Favoritos">
          {filtered.map((item) => (
            <li key={item.id}>
              <article className={`hub-card hub-card--favorite hub-card--${item.kind}`}>
                {item.avatar ? (
                  <img className="hub-card__avatar" src={item.avatar} alt="" />
                ) : (
                  <span className={`hub-card__icon hub-card__icon--${item.kind}`}>
                    <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                  </span>
                )}
                <div className="hub-card__body">
                  <div className="hub-card__meta">
                    {FAVORITE_FILTERS.find((f) => f.id === item.kind)?.label}
                    {item.lastAccess ? ` · Último acesso ${item.lastAccess}` : ""}
                  </div>
                  <h2 className="hub-card__title">{item.title}</h2>
                  <p className="hub-card__desc">{item.subtitle}</p>
                </div>
                <div className="hub-card__actions">
                  <Link className="hub-card__link" to={item.href}>
                    Acessar
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </Link>
                  <button
                    className="hub-card__remove"
                    type="button"
                    onClick={() => removeFavorite(item.id)}
                    aria-label={`Remover favorito ${item.title}`}
                  >
                    <i className="fa-regular fa-star" aria-hidden="true" />
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="hub-page__empty">
          <i className="fa-regular fa-star" aria-hidden="true" />
          <p>Nenhum favorito encontrado. Marque pessoas, grupos, serviços ou documentos para fixá-los aqui.</p>
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} de {favoriteIds.size} favoritos
      </p>
    </main>
  );
}
