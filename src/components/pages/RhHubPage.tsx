import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RH_RECENT, RH_HUB_PATH, filterRhSections } from "../../config/rh-hub";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/documents-hub-page.css";

export function RhHubPage() {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => filterRhSections(query), [query]);

  return (
    <main className={sectionMainClass("rh")}>
      <SectionPageHead
        section="rh"
        title="RH & Pessoas"
        description="Benefícios, contracheque, férias, solicitações e demais serviços de RH — o mesmo conteúdo disponível na seção RH & Pessoas do menu Serviços."
        toolbar={
          <section className="docs-hub__controls" aria-label="Busca">
            <div className="docs-hub__summary">
              <div className="docs-hub__summary-icon docs-hub__summary-icon--rh" aria-hidden="true">
                <i className="fa-solid fa-user-tie" />
              </div>
              <div>
                <div className="docs-hub__summary-title">Hub de Recursos Humanos</div>
                <p className="docs-hub__summary-text">
                  Centralize solicitações, consultas e benefícios em um só lugar.
                </p>
              </div>
            </div>
            <label className="page-search docs-hub__search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar serviços de RH..."
                aria-label="Buscar serviços de RH"
              />
            </label>
          </section>
        }
      />

      {sections.length > 0 ? (
        <section className="docs-hub__grid docs-hub__grid--quad" aria-label="Serviços de RH">
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
          <i className="fa-regular fa-user-tie" aria-hidden="true" />
          <p>Nenhum serviço encontrado para a busca informada.</p>
        </div>
      )}

      <section className="docs-hub__recent" aria-label="Serviços acessados recentemente">
        <h2 className="docs-hub__section-title">Acessados recentemente</h2>
        <ul className="docs-hub__recent-list">
          {RH_RECENT.map((item) => (
            <li key={item.id}>
              <Link className="docs-hub__recent-item" to={item.href}>
                <span className="docs-hub__recent-icon docs-hub__recent-icon--rh" aria-hidden="true">
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

export { RH_HUB_PATH };
