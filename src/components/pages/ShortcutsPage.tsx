import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { DEFAULT_SHORTCUTS, SHORTCUT_SUGGESTIONS, type ShortcutItem } from "../../config/shortcuts";
import "../../styles/hub-pages.css";

export function ShortcutsPage() {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>(DEFAULT_SHORTCUTS);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");

  const removeShortcut = (id: string) => {
    setShortcuts((prev) => prev.filter((item) => item.id !== id));
  };

  const addShortcut = (event: FormEvent) => {
    event.preventDefault();
    const trimmedLabel = label.trim();
    const trimmedHref = href.trim();
    if (!trimmedLabel || !trimmedHref) return;

    setShortcuts((prev) => [
      ...prev,
      {
        id: `sc-custom-${Date.now()}`,
        label: trimmedLabel,
        description: "Atalho personalizado",
        href: trimmedHref.startsWith("/") ? trimmedHref : `/${trimmedHref}`,
        icon: "fa-link",
        mod: "custom",
      },
    ]);
    setLabel("");
    setHref("");
  };

  const addSuggestion = (suggestion: (typeof SHORTCUT_SUGGESTIONS)[number]) => {
    if (shortcuts.some((item) => item.href === suggestion.href)) return;
    setShortcuts((prev) => [
      ...prev,
      {
        id: `sc-sug-${suggestion.href}`,
        label: suggestion.label,
        description: "Sugestão adicionada",
        href: suggestion.href,
        icon: suggestion.icon,
        mod: "custom",
      },
    ]);
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Atalhos</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Atalhos</h1>
            <p className="page-header__desc">
              Links rápidos configurados por você para qualquer área do portal — serviços, documentos,
              pessoas e mais.
            </p>
          </div>
        </div>
      </header>

      <section className="hub-page__controls hub-page__controls--shortcuts" aria-label="Resumo">
        <div className="hub-page__summary">
          <div className="hub-page__summary-icon hub-page__summary-icon--shortcuts" aria-hidden="true">
            <i className="fa-solid fa-bolt" />
          </div>
          <div>
            <div className="hub-page__summary-title">
              {shortcuts.length} atalho{shortcuts.length === 1 ? "" : "s"} configurado{shortcuts.length === 1 ? "" : "s"}
            </div>
            <p className="hub-page__summary-text">
              Atalhos são links que você define manualmente. Use favoritos para marcar itens dentro das
              áreas e bookmarks para salvar conteúdos específicos.
            </p>
          </div>
        </div>
      </section>

      <div className="hub-page__shortcuts-layout">
        <section aria-label="Meus atalhos">
          <h2 className="hub-page__section-title">Meus atalhos</h2>
          {shortcuts.length > 0 ? (
            <div className="hub-page__shortcuts-grid">
              {shortcuts.map((item) => (
                <article key={item.id} className={`hub-shortcut hub-shortcut--${item.mod}`}>
                  <Link className="hub-shortcut__link" to={item.href}>
                    <span className={`hub-shortcut__icon hub-shortcut__icon--${item.mod}`}>
                      <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                    </span>
                    <span className="hub-shortcut__label">{item.label}</span>
                    <span className="hub-shortcut__desc">{item.description}</span>
                  </Link>
                  <button
                    className="hub-shortcut__remove"
                    type="button"
                    onClick={() => removeShortcut(item.id)}
                    aria-label={`Remover atalho ${item.label}`}
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="hub-page__empty">
              <i className="fa-solid fa-bolt" aria-hidden="true" />
              <p>Nenhum atalho configurado. Adicione um abaixo ou escolha uma sugestão.</p>
            </div>
          )}
        </section>

        <aside className="hub-page__shortcuts-aside" aria-label="Adicionar atalho">
          <h2 className="hub-page__section-title">Adicionar atalho</h2>
          <form className="hub-form" onSubmit={addShortcut}>
            <label className="hub-form__field">
              <span>Nome do atalho</span>
              <input
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Ex.: Meu contracheque"
              />
            </label>
            <label className="hub-form__field">
              <span>Caminho no portal</span>
              <input
                type="text"
                value={href}
                onChange={(event) => setHref(event.target.value)}
                placeholder="Ex.: /servicos/contracheque"
              />
            </label>
            <button className="hub-form__submit" type="submit">
              <i className="fa-solid fa-plus" aria-hidden="true" />
              Adicionar atalho
            </button>
          </form>

          <h3 className="hub-page__subsection-title">Sugestões</h3>
          <div className="hub-page__suggestions">
            {SHORTCUT_SUGGESTIONS.map((item) => (
              <button
                key={item.href}
                className="hub-page__suggestion"
                type="button"
                onClick={() => addSuggestion(item)}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" />
                {item.label}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
