import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useExploreGroups, useMyGroups } from "../../api/hooks/useGroups";
import {
  GRUPOS_RECENT,
  buildGruposRecentFromGroups,
  buildGruposSections,
  filterGruposSections,
} from "../../config/grupos-hub";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/documents-hub-page.css";

export function GruposHubPage() {
  const [query, setQuery] = useState("");
  const { data: myGroups, isLoading: myGroupsLoading } = useMyGroups();
  const { data: exploreGroups, isLoading: exploreLoading } = useExploreGroups();

  const baseSections = useMemo(
    () =>
      buildGruposSections(
        myGroupsLoading ? null : myGroups?.length ?? null,
        exploreLoading ? null : exploreGroups?.length ?? null,
      ),
    [myGroups, myGroupsLoading, exploreGroups, exploreLoading],
  );
  const sections = useMemo(
    () => filterGruposSections(query, baseSections),
    [query, baseSections],
  );
  const recentItems = useMemo(
    () => (myGroups && myGroups.length > 0 ? buildGruposRecentFromGroups(myGroups) : GRUPOS_RECENT),
    [myGroups],
  );

  return (
    <main className={sectionMainClass("grupos")}>
      <SectionPageHead
        section="grupos"
        title="Grupos"
        description="Meus grupos, explorar comunidades e criar novos espaços de colaboração — o mesmo conteúdo disponível no menu Grupos da barra superior."
        toolbar={
          <section className="docs-hub__controls" aria-label="Busca">
            <div className="docs-hub__summary">
              <div className="docs-hub__summary-icon docs-hub__summary-icon--grupos" aria-hidden="true">
                <i className="fa-solid fa-people-group" />
              </div>
              <div>
                <div className="docs-hub__summary-title">Hub de Grupos</div>
                <p className="docs-hub__summary-text">
                  Participe de comunidades internas, acompanhe publicações e conecte-se com outras áreas.
                </p>
              </div>
            </div>
            <label className="page-search docs-hub__search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar seções de grupos..."
                aria-label="Buscar seções de grupos"
              />
            </label>
          </section>
        }
      />

      {sections.length > 0 ? (
        <section className="docs-hub__grid docs-hub__grid--quad" aria-label="Seções de grupos">
          {sections.map((section) =>
            section.disabled ? (
              <article
                key={section.id}
                className={`docs-hub__card docs-hub__card--${section.mod} docs-hub__card--disabled`}
                aria-disabled="true"
              >
                <span className={`docs-hub__card-icon docs-hub__card-icon--${section.mod}`}>
                  <i className={`fa-solid ${section.icon}`} aria-hidden="true" />
                </span>
                <span className="docs-hub__card-title">{section.label}</span>
                <span className="docs-hub__card-desc">{section.description}</span>
                <span className="docs-hub__card-count">{section.count}</span>
              </article>
            ) : (
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
            ),
          )}
        </section>
      ) : (
        <div className="docs-hub__empty">
          <i className="fa-regular fa-people-group" aria-hidden="true" />
          <p>Nenhuma seção encontrada para a busca informada.</p>
        </div>
      )}

      <section className="docs-hub__recent" aria-label="Grupos acessados recentemente">
        <h2 className="docs-hub__section-title">Acessados recentemente</h2>
        <ul className="docs-hub__recent-list">
          {recentItems.map((item) => (
            <li key={item.id}>
              <Link className="docs-hub__recent-item" to={item.href}>
                <span className="docs-hub__recent-icon docs-hub__recent-icon--grupo" aria-hidden="true">
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
