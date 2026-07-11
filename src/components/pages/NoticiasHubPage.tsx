import { useState } from "react";
import { Link } from "react-router-dom";
import { useNews } from "../../api/hooks/useF3";
import { useCreateTypedPost, usePinPost } from "../../api/hooks/useFeed";
import { POST_TYPE_NEWS } from "../../api/types";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import "../../styles/documents-hub-page.css";

export function NoticiasHubPage() {
  const [query, setQuery] = useState("");
  const [content, setContent] = useState("");
  const news = useNews();
  const createNews = useCreateTypedPost(POST_TYPE_NEWS);
  const pin = usePinPost();
  const { hasPermission } = usePermissions();
  const items = (news.data ?? []).filter((item) => `${item.title ?? ""} ${item.content} ${item.excerpt ?? ""}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Notícias</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Notícias</h1>
            <p className="page-header__desc">
              Acompanhe as notícias publicadas para toda a empresa.
            </p>
          </div>
        </div>
      </header>

      <section className="docs-hub__controls" aria-label="Busca">
        <div className="docs-hub__summary">
          <div className="docs-hub__summary-icon docs-hub__summary-icon--noticias" aria-hidden="true">
            <i className="fa-solid fa-newspaper" />
          </div>
          <div>
            <div className="docs-hub__summary-title">Hub de Notícias</div>
            <p className="docs-hub__summary-text">
              Atualizações editoriais e institucionais em um único lugar.
            </p>
          </div>
        </div>
        <label className="page-search docs-hub__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar notícias..."
            aria-label="Buscar notícias"
          />
        </label>
      </section>

      {hasPermission(PERMISSIONS.news.manage) ? <form className="docs-hub__controls" onSubmit={(event) => { event.preventDefault(); void createNews.mutateAsync({ content }).then(() => setContent("")); }}><label>Publicar notícia<textarea value={content} onChange={(event) => setContent(event.target.value)} required /></label><button className="official-card__cta" disabled={createNews.isPending}>Publicar</button></form> : null}
      {news.isLoading ? <p className="page-empty-note">Carregando notícias...</p> : items.length ? <section className="official-list" aria-label="Notícias">{items.map((item) => <article className="official-card" key={item.id}><div className="official-card__body"><div className="official-card__meta">{item.isPinned ? <span className="tag">Fixada</span> : null}<span className="official-card__date">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</span></div><h2 className="official-card__title">{item.title ?? "Notícia"}</h2><p className="official-card__excerpt">{item.excerpt ?? item.content}</p>{hasPermission(PERMISSIONS.feed.manage) ? <button type="button" className="official-card__cta" onClick={() => void pin.mutateAsync({ id: item.id, isPinned: !item.isPinned })}>{item.isPinned ? "Desafixar" : "Fixar"}</button> : null}</div></article>)}</section> : <div className="docs-hub__empty"><p>Nenhuma notícia encontrada.</p></div>}
      <p className="page-empty-note"><Link to="/comunicados">Ver comunicados</Link></p>
    </main>
  );
}
