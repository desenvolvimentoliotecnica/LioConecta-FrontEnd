import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBookmarkCatalog } from "../../api/hooks/useBookmarkCatalog";
import { usePreferences, useUpdatePreferences } from "../../api/hooks/usePreferences";
import { useSystems } from "../../api/hooks/useSystems";
import {
  BOOKMARK_FILTERS,
  filterBookmarks,
  normalizeBookmarkKind,
  type BookmarkItem,
  type BookmarkKind,
} from "../../config/bookmarks";
import { systemBookmarkItems } from "../../config/systems/bookmarks";
import "../../styles/hub-pages.css";

function BookmarkOpenLink({ href, title }: { href: string; title: string }) {
  if (/^https?:\/\//i.test(href)) {
    return (
      <a className="hub-card__link" href={href} target="_blank" rel="noopener noreferrer">
        Abrir
        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link className="hub-card__link" to={href} aria-label={`Abrir ${title}`}>
      Abrir
      <i className="fa-solid fa-arrow-right" aria-hidden="true" />
    </Link>
  );
}

function formatSavedAt(iso?: string): { savedAt: string; savedDateTime: string } {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return {
      savedAt: now.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
      savedDateTime: now.toISOString(),
    };
  }
  return {
    savedAt: date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }),
    savedDateTime: date.toISOString(),
  };
}

export function BookmarksPage() {
  const [kind, setKind] = useState<BookmarkKind>("all");
  const [query, setQuery] = useState("");
  const { data: preferences } = usePreferences();
  const { data: catalog = [], isLoading: catalogLoading } = useBookmarkCatalog();
  const updatePreferences = useUpdatePreferences();
  const { data: systems = [] } = useSystems({ includeInactive: true });

  const defaultIds = useMemo(
    () => catalog.filter((item) => item.isDefault).map((item) => item.seedKey),
    [catalog],
  );

  const savedIds = useMemo(() => {
    if (preferences?.bookmarks && preferences.bookmarks.length > 0) {
      return new Set(preferences.bookmarks);
    }
    return new Set(defaultIds);
  }, [preferences?.bookmarks, defaultIds]);

  const catalogByKey = useMemo(() => {
    const map = new Map(catalog.map((item) => [item.seedKey, item]));
    return map;
  }, [catalog]);

  const allBookmarks = useMemo(() => {
    const fromCatalog: BookmarkItem[] = [];
    for (const id of savedIds) {
      const entry = catalogByKey.get(id);
      if (!entry) continue;
      const { savedAt, savedDateTime } = formatSavedAt();
      fromCatalog.push({
        id: entry.seedKey,
        kind: normalizeBookmarkKind(entry.kind),
        title: entry.title,
        excerpt: entry.excerpt,
        href: entry.href,
        icon: entry.icon,
        savedAt,
        savedDateTime,
        source: entry.source,
      });
    }

    const dynamicSystemBookmarks = systemBookmarkItems(systems, savedIds);
    const knownIds = new Set(fromCatalog.map((item) => item.id));

    return [
      ...fromCatalog,
      ...dynamicSystemBookmarks.filter((item) => !knownIds.has(item.id)),
    ];
  }, [savedIds, catalogByKey, systems]);

  const filtered = useMemo(() => filterBookmarks(allBookmarks, kind, query), [allBookmarks, kind, query]);

  const removeBookmark = (id: string) => {
    const next = [...savedIds].filter((entry) => entry !== id);
    updatePreferences.mutate({ bookmarks: next });
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Bookmarks</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Bookmarks</h1>
            <p className="page-header__desc">
              Conteúdos que você salvou para consultar depois — comunicados, posts do feed, documentos,
              sistemas e solicitações em andamento.
            </p>
          </div>
        </div>
      </header>

      <section className="hub-page__controls hub-page__controls--bookmarks" aria-label="Filtros">
        <div className="hub-page__summary">
          <div className="hub-page__summary-icon hub-page__summary-icon--bookmarks" aria-hidden="true">
            <i className="fa-solid fa-bookmark" />
          </div>
          <div>
            <div className="hub-page__summary-title">
              {savedIds.size} item{savedIds.size === 1 ? "" : "s"} salvo{savedIds.size === 1 ? "" : "s"}
            </div>
            <p className="hub-page__summary-text">
              Bookmarks são referências pontuais: algo que você marcou para ler, retomar ou acompanhar
              mais tarde. Diferente de favoritos, que são itens que você usa com frequência.
            </p>
          </div>
        </div>

        <div className="hub-page__toolbar">
          <div className="page-filters" role="group" aria-label="Filtrar bookmarks">
            {BOOKMARK_FILTERS.map((entry) => (
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
              placeholder="Buscar bookmarks..."
              aria-label="Buscar bookmarks"
            />
          </label>
        </div>
      </section>

      {catalogLoading ? (
        <div className="hub-page__empty">
          <p>Carregando catálogo de bookmarks...</p>
        </div>
      ) : filtered.length > 0 ? (
        <ul className="hub-page__list hub-page__list--bookmarks" aria-label="Bookmarks salvos">
          {filtered.map((item) => (
            <li key={item.id}>
              <article className={`hub-card hub-card--bookmark hub-card--${item.kind}`}>
                <span className={`hub-card__icon hub-card__icon--${item.kind}`}>
                  <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                </span>
                <div className="hub-card__body">
                  <div className="hub-card__meta">{item.source}</div>
                  <h2 className="hub-card__title">{item.title}</h2>
                  <p className="hub-card__desc">{item.excerpt}</p>
                  <time className="hub-card__time" dateTime={item.savedDateTime}>
                    Salvo em {item.savedAt}
                  </time>
                </div>
                <div className="hub-card__actions">
                  <BookmarkOpenLink href={item.href} title={item.title} />
                  <button
                    className="hub-card__remove"
                    type="button"
                    onClick={() => removeBookmark(item.id)}
                    aria-label={`Remover bookmark ${item.title}`}
                  >
                    <i className="fa-regular fa-trash-can" aria-hidden="true" />
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="hub-page__empty">
          <i className="fa-regular fa-bookmark" aria-hidden="true" />
          <p>Nenhum bookmark encontrado. Salve comunicados, posts, documentos ou sistemas para vê-los aqui.</p>
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} de {savedIds.size} bookmarks
      </p>
    </main>
  );
}
