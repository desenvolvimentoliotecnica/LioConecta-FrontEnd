import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PARABENIZACOES_HUB_PATH,
  filterParabenizacoesSections,
} from "../../config/parabenizacoes-hub";
import "../../styles/documents-hub-page.css";

export function ParabenizacoesHubPage() {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => filterParabenizacoesSections(query), [query]);

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Parabenizações</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Parabenizações</h1>
            <p className="page-header__desc">
              Celebre aniversários, novos colaboradores e conquistas publicadas no feed.
            </p>
          </div>
        </div>
      </header>

      <section className="docs-hub__controls" aria-label="Busca">
        <div className="docs-hub__summary">
          <div
            className="docs-hub__summary-icon docs-hub__summary-icon--parabenizacoes"
            aria-hidden="true"
          >
            <i className="fa-solid fa-champagne-glasses" />
          </div>
          <div>
            <div className="docs-hub__summary-title">Hub de Parabenizações</div>
            <p className="docs-hub__summary-text">
              Encontre celebrações no feed e nas listas de pessoas da empresa.
            </p>
          </div>
        </div>
        <label className="page-search docs-hub__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar celebrações..."
            aria-label="Buscar celebrações"
          />
        </label>
      </section>

      {sections.length > 0 ? (
        <section className="docs-hub__grid docs-hub__grid--quad" aria-label="Categorias de parabenizações">
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
              {section.count ? <span className="docs-hub__card-count">{section.count}</span> : null}
              <span className="docs-hub__card-action">
                Acessar
                <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </section>
      ) : (
        <div className="docs-hub__empty">
          <i className="fa-regular fa-champagne-glasses" aria-hidden="true" />
          <p>Nenhuma categoria encontrada para a busca informada.</p>
        </div>
      )}
    </main>
  );
}

export { PARABENIZACOES_HUB_PATH };
