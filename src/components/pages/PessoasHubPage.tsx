import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PESSOAS_RECENT, filterPessoasSections } from "../../config/pessoas-hub";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/documents-hub-page.css";

export function PessoasHubPage() {
  const [query, setQuery] = useState("");
  const sections = useMemo(() => filterPessoasSections(query), [query]);

  return (
    <main className={sectionMainClass("pessoas")}>
      <SectionPageHead
        section="pessoas"
        title="Pessoas"
        description="Diretório, novos colaboradores, aniversariantes e organograma — o mesmo conteúdo disponível no menu Pessoas da barra superior."
        toolbar={
          <section className="docs-hub__controls" aria-label="Busca">
            <div className="docs-hub__summary">
              <div className="docs-hub__summary-icon docs-hub__summary-icon--pessoas" aria-hidden="true">
                <i className="fa-solid fa-users" />
              </div>
              <div>
                <div className="docs-hub__summary-title">Hub de Pessoas</div>
                <p className="docs-hub__summary-text">
                  Encontre colegas, conheça novos integrantes e explore a estrutura da empresa.
                </p>
              </div>
            </div>
            <label className="page-search docs-hub__search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar seções de pessoas..."
                aria-label="Buscar seções de pessoas"
              />
            </label>
          </section>
        }
      />

      {sections.length > 0 ? (
        <section className="docs-hub__grid docs-hub__grid--quad" aria-label="Seções de pessoas">
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
          <i className="fa-regular fa-user" aria-hidden="true" />
          <p>Nenhuma seção encontrada para a busca informada.</p>
        </div>
      )}

      <section className="docs-hub__recent" aria-label="Perfis acessados recentemente">
        <h2 className="docs-hub__section-title">Acessados recentemente</h2>
        <ul className="docs-hub__recent-list">
          {PESSOAS_RECENT.map((item) => (
            <li key={item.id}>
              <Link className="docs-hub__recent-item" to={item.href}>
                <span className="docs-hub__recent-icon docs-hub__recent-icon--pessoas" aria-hidden="true">
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
