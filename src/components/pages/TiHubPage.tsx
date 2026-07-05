import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TI_HUB_PATH, TI_RECENT, filterTiSections } from "../../config/ti-hub";
import "../../styles/documents-hub-page.css";

export function TiHubPage() {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => filterTiSections(query), [query]);

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Tecnologia da Informação</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Tecnologia da Informação</h1>
            <p className="page-header__desc">
              Help Desk, equipamentos, acessos e VPN — o mesmo conteúdo disponível na seção TI
              &amp; Suporte do menu Serviços.
            </p>
          </div>
        </div>
      </header>

      <section className="docs-hub__controls" aria-label="Busca">
        <div className="docs-hub__summary">
          <div className="docs-hub__summary-icon docs-hub__summary-icon--ti" aria-hidden="true">
            <i className="fa-solid fa-laptop-code" />
          </div>
          <div>
            <div className="docs-hub__summary-title">Hub de TI &amp; Suporte</div>
            <p className="docs-hub__summary-text">
              Abra chamados, solicite equipamentos e gerencie acessos aos sistemas corporativos.
            </p>
          </div>
        </div>
        <label className="page-search docs-hub__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar serviços de TI..."
            aria-label="Buscar serviços de TI"
          />
        </label>
      </section>

      {sections.length > 0 ? (
        <section className="docs-hub__grid docs-hub__grid--quad" aria-label="Serviços de TI">
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
          <i className="fa-regular fa-laptop" aria-hidden="true" />
          <p>Nenhum serviço encontrado para a busca informada.</p>
        </div>
      )}

      <section className="docs-hub__recent" aria-label="Serviços acessados recentemente">
        <h2 className="docs-hub__section-title">Acessados recentemente</h2>
        <ul className="docs-hub__recent-list">
          {TI_RECENT.map((item) => (
            <li key={item.id}>
              <Link className="docs-hub__recent-item" to={item.href}>
                <span className="docs-hub__recent-icon docs-hub__recent-icon--ti" aria-hidden="true">
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

export { TI_HUB_PATH };
