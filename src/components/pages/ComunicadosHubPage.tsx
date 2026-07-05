import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  COMUNICADOS_HUB_PATH,
  COMUNICADOS_RECENT,
  filterComunicadosSections,
} from "../../config/comunicados-hub";
import "../../styles/documents-hub-page.css";

export function ComunicadosHubPage() {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => filterComunicadosSections(query), [query]);

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Comunicados</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Comunicados</h1>
            <p className="page-header__desc">
              Oficiais, departamentais, urgentes e arquivo — o mesmo conteúdo disponível no menu
              Comunicados da barra superior.
            </p>
          </div>
        </div>
      </header>

      <section className="docs-hub__controls" aria-label="Busca">
        <div className="docs-hub__summary">
          <div className="docs-hub__summary-icon docs-hub__summary-icon--comunicados" aria-hidden="true">
            <i className="fa-solid fa-bullhorn" />
          </div>
          <div>
            <div className="docs-hub__summary-title">Hub de Comunicados</div>
            <p className="docs-hub__summary-text">
              Acompanhe avisos institucionais e publicações das áreas da empresa.
            </p>
          </div>
        </div>
        <label className="page-search docs-hub__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar categorias de comunicados..."
            aria-label="Buscar categorias de comunicados"
          />
        </label>
      </section>

      {sections.length > 0 ? (
        <section className="docs-hub__grid docs-hub__grid--quad" aria-label="Categorias de comunicados">
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
          <i className="fa-regular fa-bullhorn" aria-hidden="true" />
          <p>Nenhuma categoria encontrada para a busca informada.</p>
        </div>
      )}

      <section className="docs-hub__recent" aria-label="Comunicados acessados recentemente">
        <h2 className="docs-hub__section-title">Acessados recentemente</h2>
        <ul className="docs-hub__recent-list">
          {COMUNICADOS_RECENT.map((item) => (
            <li key={item.id}>
              <Link className="docs-hub__recent-item" to={item.href}>
                <span
                  className="docs-hub__recent-icon docs-hub__recent-icon--comunicados"
                  aria-hidden="true"
                >
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

export { COMUNICADOS_HUB_PATH };
