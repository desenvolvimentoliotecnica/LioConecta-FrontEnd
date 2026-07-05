import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  HELP_ARTICLES,
  HELP_CATEGORIES,
  HELP_CONTACTS,
  HELP_GUIDES,
  filterHelpArticles,
  type HelpCategory,
} from "../../config/help";
import "../../styles/help-page.css";

export function HelpPage() {
  const [category, setCategory] = useState<HelpCategory>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(HELP_ARTICLES[0]?.id ?? null);

  const filtered = useMemo(
    () => filterHelpArticles(HELP_ARTICLES, category, query),
    [category, query],
  );

  const toggleArticle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Ajuda</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Central de Ajuda</h1>
            <p className="page-header__desc">
              Encontre respostas sobre o LioConecta — feed, comunicados, pessoas, grupos, documentos,
              serviços digitais e suporte.
            </p>
          </div>
        </div>
      </header>

      <section className="help-page__controls" aria-label="Busca e categorias">
        <div className="help-page__summary">
          <div className="help-page__summary-icon" aria-hidden="true">
            <i className="fa-regular fa-life-ring" />
          </div>
          <div>
            <div className="help-page__summary-title">Como podemos ajudar?</div>
            <p className="help-page__summary-text">
              Pesquise na base de perguntas frequentes ou filtre por área do portal. Se não encontrar
              o que precisa, entre em contato com um dos canais de suporte abaixo.
            </p>
          </div>
        </div>

        <div className="help-page__toolbar">
          <div className="page-filters" role="group" aria-label="Filtrar por categoria">
            {HELP_CATEGORIES.map((entry) => (
              <button
                key={entry.id}
                className={`filter-chip${category === entry.id ? " is-active" : ""}`}
                type="button"
                onClick={() => setCategory(entry.id)}
              >
                <i className={`fa-solid ${entry.icon}`} aria-hidden="true" style={{ marginRight: 6 }} />
                {entry.label}
              </button>
            ))}
          </div>
          <label className="page-search help-page__search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar na central de ajuda..."
              aria-label="Buscar na central de ajuda"
            />
          </label>
        </div>
      </section>

      <section className="help-page__guides" aria-label="Guias rápidos">
        <h2 className="help-page__section-title">Guias rápidos</h2>
        <div className="help-page__guides-grid">
          {HELP_GUIDES.map((guide) => (
            <Link key={guide.id} className={`help-page__guide help-page__guide--${guide.mod}`} to={guide.href}>
              <span className={`help-page__guide-icon help-page__guide-icon--${guide.mod}`}>
                <i className={`fa-solid ${guide.icon}`} aria-hidden="true" />
              </span>
              <span className="help-page__guide-title">{guide.title}</span>
              <span className="help-page__guide-desc">{guide.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="help-page__layout" aria-label="Perguntas frequentes e contatos">
        <div className="help-page__faq">
          <h2 className="help-page__section-title">Perguntas frequentes</h2>
          {filtered.length > 0 ? (
            <div className="help-page__faq-list">
              {filtered.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <article
                    key={item.id}
                    className={`help-page__faq-item${isOpen ? " is-open" : ""}`}
                  >
                    <button
                      className="help-page__faq-trigger"
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => toggleArticle(item.id)}
                    >
                      <span>{item.question}</span>
                      <i className={`fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`} aria-hidden="true" />
                    </button>
                    {isOpen ? (
                      <div className="help-page__faq-body">
                        <p>{item.answer}</p>
                        {item.href && item.hrefLabel ? (
                          <Link className="help-page__faq-link" to={item.href}>
                            {item.hrefLabel}
                            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="help-page__empty">
              <i className="fa-regular fa-circle-question" aria-hidden="true" />
              <p>Nenhum resultado encontrado. Tente outra busca ou categoria.</p>
            </div>
          )}
        </div>

        <aside className="help-page__contacts" aria-label="Canais de suporte">
          <h2 className="help-page__section-title">Fale conosco</h2>
          <div className="help-page__contacts-list">
            {HELP_CONTACTS.map((contact) => (
              <Link
                key={contact.id}
                className={`help-page__contact help-page__contact--${contact.mod}`}
                to={contact.href}
              >
                <span className={`help-page__contact-icon help-page__contact-icon--${contact.mod}`}>
                  <i className={`fa-solid ${contact.icon}`} aria-hidden="true" />
                </span>
                <span className="help-page__contact-title">{contact.title}</span>
                <span className="help-page__contact-desc">{contact.description}</span>
                <span className="help-page__contact-channel">{contact.channel}</span>
                <span className="help-page__contact-hours">
                  <i className="fa-regular fa-clock" aria-hidden="true" /> {contact.hours}
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <p className="page-empty-note">
        Exibindo {filtered.length} de {HELP_ARTICLES.length} artigos de ajuda
      </p>
    </main>
  );
}
