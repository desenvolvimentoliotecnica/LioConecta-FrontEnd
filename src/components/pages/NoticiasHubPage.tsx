import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { NOTICIAS_HUB_PATH, NOTICIAS_RECENT, filterNoticiasSections } from "../../config/noticias-hub";
import "../../styles/documents-hub-page.css";

export function NoticiasHubPage() {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => filterNoticiasSections(query), [query]);

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Notícias</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Notícias</h1>
            <p className="page-header__desc">
              Destaques editoriais no feed, comunicados oficiais e publicações departamentais —
              fique por dentro do que acontece na Liotécnica.
            </p>
          </div>
        </div>
      </header>

      <section className="docs-hub__controls" aria-label="Busca">
        <div className="docs-hub__summary">
          <div className="docs-hub__summary-icon docs-hub__summary-icon--noticias" aria-hidden="true">
            <i className="fa-solid fa-newspaper" />
          </div>
          <div>
            <div className="docs-hub__summary-title">Hub de Notícias</div>
            <p className="docs-hub__summary-text">
              Acesse notícias do feed, releases institucionais e atualizações por área.
            </p>
          </div>
        </div>
        <label className="page-search docs-hub__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar notícias..."
            aria-label="Buscar notícias"
          />
        </label>
      </section>

      {sections.length > 0 ? (
        <section className="docs-hub__grid docs-hub__grid--quad" aria-label="Categorias de notícias">
          {sections.map((section) => (
            <Link
              key={section.id}
              className={`docs-hub__card docs-hub__card--${section.mod}`}
              to={section.path}
            >
              <span className={`docs-hub__card-icon docs-hub__card-icon--${section.mod}`}>
                <i className={`fa-solid ${section.icon}`} aria-hidden="true" />
              </span>
              <span className="docs-hub__card-title">{section.label}</span>
              <span className="docs-hub__card-desc">{section.description}</span>
              <span className="docs-hub__card-count">{section.count}</span>
              <span className="docs-hub__card-action">
                Acessar
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>
      ) : (
        <div className="docs-hub__empty">
          <i className="fa-regular fa-newspaper" aria-hidden="true" />
          <p>Nenhuma categoria encontrada para a busca informada.</p>
        </div>
      )}

      <section className="docs-hub__recent" aria-label="Notícias recentes">
        <h2 className="docs-hub__section-title">Recentes</h2>
        <ul className="docs-hub__recent-list">
          {NOTICIAS_RECENT.map((item) => (
            <li key={item.id}>
              <Link className="docs-hub__recent-item" to={item.href}>
                <span className="docs-hub__recent-icon docs-hub__recent-icon--noticias" aria-hidden="true">
                  <i className={`fa-solid ${item.icon}`} />
                </span>
                <span className="docs-hub__recent-body">
                  <strong>{item.title}</strong>
                  <span>
                    {item.section} · {item.date}
                  </span>
                </span>
                <i className="fa-solid fa-chevron-right docs-hub__recent-chevron" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export { NOTICIAS_HUB_PATH };
