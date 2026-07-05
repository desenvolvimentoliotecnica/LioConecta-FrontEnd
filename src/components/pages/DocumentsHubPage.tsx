import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  RECENT_DOCUMENTS,
  filterDocumentSections,
} from "../../config/documents-hub";
import "../../styles/documents-hub-page.css";

export function DocumentsHubPage() {
  const [query, setQuery] = useState("");

  const sections = useMemo(() => filterDocumentSections(query), [query]);

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Documentos</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Documentos</h1>
            <p className="page-header__desc">
              Central de acesso a políticas, manuais, formulários, modelos e biblioteca corporativa
              — o mesmo conteúdo disponível no menu Documentos da barra superior.
            </p>
          </div>
        </div>
      </header>

      <section className="docs-hub__controls" aria-label="Busca">
        <div className="docs-hub__summary">
          <div className="docs-hub__summary-icon" aria-hidden="true">
            <i className="fa-solid fa-folder-open" />
          </div>
          <div>
            <div className="docs-hub__summary-title">Hub de Documentos</div>
            <p className="docs-hub__summary-text">
              Escolha uma categoria abaixo para navegar pelo acervo institucional ou busque por nome
              da seção.
            </p>
          </div>
        </div>
        <label className="page-search docs-hub__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar seções de documentos..."
            aria-label="Buscar seções de documentos"
          />
        </label>
      </section>

      {sections.length > 0 ? (
        <section className="docs-hub__grid" aria-label="Categorias de documentos">
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
          <i className="fa-regular fa-folder-open" aria-hidden="true" />
          <p>Nenhuma seção encontrada para a busca informada.</p>
        </div>
      )}

      <section className="docs-hub__recent" aria-label="Documentos recentes">
        <h2 className="docs-hub__section-title">Acessados recentemente</h2>
        <ul className="docs-hub__recent-list">
          {RECENT_DOCUMENTS.map((doc) => (
            <li key={doc.id}>
              <Link className="docs-hub__recent-item" to={doc.href}>
                <span className="docs-hub__recent-icon" aria-hidden="true">
                  <i className="fa-solid fa-file-lines" />
                </span>
                <span className="docs-hub__recent-body">
                  <strong>{doc.title}</strong>
                  <span>
                    {doc.section} · {doc.date}
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
