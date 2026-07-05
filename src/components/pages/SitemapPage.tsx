import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  SITEMAP_DEFAULT_EXPANDED,
  buildSitemapSections,
  countSitemapEntries,
  filterSitemapSections,
  getSectionEntries,
  type SitemapEntry,
  type SitemapSection,
} from "../../config/sitemap";
import "../../styles/sitemap-page.css";

const ALL_SECTIONS = buildSitemapSections();
const TOTAL_ENTRIES = countSitemapEntries(ALL_SECTIONS);

function SitemapLink({ entry }: { entry: SitemapEntry }) {
  if (entry.disabled) {
    return (
      <span className="sitemap-page__link sitemap-page__link--disabled">
        <span className="sitemap-page__link-label">{entry.label}</span>
        {entry.description ? (
          <span className="sitemap-page__link-desc">{entry.description}</span>
        ) : null}
        <span className="sitemap-page__badge sitemap-page__badge--soon">Em breve</span>
      </span>
    );
  }

  return (
    <Link className="sitemap-page__link" to={entry.path}>
      <span className="sitemap-page__link-label">{entry.label}</span>
      <span className="sitemap-page__link-path">{entry.path}</span>
      {entry.description ? (
        <span className="sitemap-page__link-desc">{entry.description}</span>
      ) : null}
    </Link>
  );
}

function SectionBody({ section }: { section: SitemapSection }) {
  if (section.subsections) {
    return (
      <div className="sitemap-page__subsections">
        {section.subsections.map((sub) => (
          <div key={sub.heading} className="sitemap-page__subsection">
            <h3 className="sitemap-page__subsection-title">
              <i className={`fa-solid ${sub.icon}`} aria-hidden="true" />
              {sub.heading}
            </h3>
            <div className="sitemap-page__links">
              {sub.items.map((item) => (
                <SitemapLink key={`${sub.heading}-${item.path}-${item.label}`} entry={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="sitemap-page__links">
      {section.items?.map((item) => (
        <SitemapLink key={`${item.path}-${item.label}`} entry={item} />
      ))}
    </div>
  );
}

export function SitemapPage() {
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set(SITEMAP_DEFAULT_EXPANDED),
  );

  const filteredSections = useMemo(
    () => filterSitemapSections(ALL_SECTIONS, query),
    [query],
  );

  const visibleCount = useMemo(
    () => countSitemapEntries(filteredSections),
    [filteredSections],
  );

  useEffect(() => {
    if (query.trim()) {
      setOpenSections(new Set(filteredSections.map((section) => section.id)));
      return;
    }
    setOpenSections(new Set(SITEMAP_DEFAULT_EXPANDED));
  }, [query, filteredSections]);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Mapa do site</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Mapa do site</h1>
            <p className="page-header__desc">
              Navegue por todas as páginas do LioConecta — feed, comunicados, pessoas, grupos,
              documentos, serviços digitais, utilitários e quiosque.
            </p>
          </div>
        </div>
      </header>

      <section className="sitemap-page__controls" aria-label="Busca no mapa do site">
        <div className="sitemap-page__summary">
          <div className="sitemap-page__summary-icon" aria-hidden="true">
            <i className="fa-solid fa-sitemap" />
          </div>
          <div>
            <div className="sitemap-page__summary-title">Explore o ecossistema do portal</div>
            <p className="sitemap-page__summary-text">
              Use a busca para encontrar rapidamente uma página ou expanda cada seção para ver todos
              os destinos disponíveis.
            </p>
          </div>
        </div>

        <label className="page-search sitemap-page__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar páginas, rotas ou descrições..."
            aria-label="Buscar no mapa do site"
          />
        </label>
      </section>

      {filteredSections.length > 0 ? (
        <div className="sitemap-page__sections" aria-label="Seções do portal">
          {filteredSections.map((section) => {
            const isOpen = openSections.has(section.id);
            const entryCount = getSectionEntries(section).length;

            return (
              <article
                key={section.id}
                className={`sitemap-page__section${isOpen ? " is-open" : ""}`}
              >
                <button
                  className="sitemap-page__section-trigger"
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleSection(section.id)}
                >
                  <span className="sitemap-page__section-heading">
                    <span className="sitemap-page__section-icon" aria-hidden="true">
                      <i className={`fa-solid ${section.icon}`} />
                    </span>
                    <span>{section.label}</span>
                    <span className="sitemap-page__section-count">{entryCount}</span>
                  </span>
                  <i
                    className={`fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen ? (
                  <div className="sitemap-page__section-body">
                    <SectionBody section={section} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="sitemap-page__empty">
          <i className="fa-regular fa-map" aria-hidden="true" />
          <p>Nenhuma página encontrada. Tente outra busca.</p>
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {visibleCount} de {TOTAL_ENTRIES} páginas do portal
      </p>
    </main>
  );
}
