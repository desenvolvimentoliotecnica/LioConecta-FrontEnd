import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useWikiArticles, useWikiCategories } from "../../api/hooks/useWiki";
import {
  WIKI_ARTICLE_STATUS_ARCHIVED,
  WIKI_ARTICLE_STATUS_DRAFT,
  WIKI_ARTICLE_STATUS_PUBLISHED,
  type WikiArticleStatus,
} from "../../api/types";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { WikiSidebarTree } from "./WikiSidebarTree";
import "../../styles/wiki-page.css";

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

function statusLabel(status: WikiArticleStatus): string {
  switch (status) {
    case WIKI_ARTICLE_STATUS_DRAFT:
      return "Rascunho";
    case WIKI_ARTICLE_STATUS_PUBLISHED:
      return "Publicado";
    case WIKI_ARTICLE_STATUS_ARCHIVED:
      return "Arquivado";
    default:
      return "—";
  }
}

function statusClass(status: WikiArticleStatus): string {
  switch (status) {
    case WIKI_ARTICLE_STATUS_DRAFT:
      return "wiki-badge--draft";
    case WIKI_ARTICLE_STATUS_PUBLISHED:
      return "wiki-badge--published";
    case WIKI_ARTICLE_STATUS_ARCHIVED:
      return "wiki-badge--archived";
    default:
      return "wiki-badge--draft";
  }
}

function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    acesso: "Acesso",
    hardware: "Hardware",
    software: "Software",
  };
  return map[category.toLowerCase()] ?? category;
}

export function WikiHubPage() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.wiki.manage);

  const [query, setQuery] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const articlesQuery = useWikiArticles({
    q: debouncedQ || undefined,
    category: category ?? undefined,
    manage: canManage,
  });
  const categoriesQuery = useWikiCategories(canManage);

  const articles = articlesQuery.data ?? [];
  const totalCount = useMemo(
    () =>
      (categoriesQuery.data ?? []).reduce((sum, c) => sum + c.count, 0) ||
      articles.length,
    [categoriesQuery.data, articles.length],
  );

  return (
    <main className={`${sectionMainClass("documentos")} wiki-page`}>
      <SectionPageHead
        section="documentos"
        title="Wiki"
        description="Base de conhecimento interna — guias de acesso, hardware e software."
        current="Wiki"
        actions={
          canManage ? (
            <Link to="/documentos/wiki/novo" className="btn btn--primary">
              <i className="fa-solid fa-plus" aria-hidden="true" /> Novo artigo
            </Link>
          ) : null
        }
        toolbar={
          <div className="wiki-toolbar">
            <label className="wiki-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar artigos…"
                aria-label="Buscar artigos da Wiki"
              />
            </label>
          </div>
        }
      />

      <div className="wiki-shell">
        <WikiSidebarTree
          categories={categoriesQuery.data}
          selectedCategory={category}
          onSelect={setCategory}
          totalCount={totalCount}
        />

        <div className="wiki-shell__content">
          {articlesQuery.isLoading ? (
            <p className="wiki-loading">Carregando artigos…</p>
          ) : null}
          {articlesQuery.isError ? (
            <p className="wiki-error" role="alert">
              Não foi possível carregar os artigos da Wiki.
            </p>
          ) : null}

          {!articlesQuery.isLoading && !articlesQuery.isError ? (
            articles.length === 0 ? (
              <p className="wiki-empty">Nenhum artigo encontrado.</p>
            ) : (
              <ul className="wiki-article-list">
                {articles.map((article) => (
                  <li key={article.id}>
                    <Link
                      to={`/documentos/wiki/${encodeURIComponent(article.slug)}`}
                      className="wiki-article-card"
                    >
                      <h2 className="wiki-article-card__title">{article.title}</h2>
                      {article.summary ? (
                        <p className="wiki-article-card__summary">{article.summary}</p>
                      ) : null}
                      <div className="wiki-article-card__meta">
                        <span>{categoryLabel(article.category)}</span>
                        <span>Atualizado em {formatDate(article.updatedAt)}</span>
                        {canManage ? (
                          <span className={`wiki-badge ${statusClass(article.status)}`}>
                            {statusLabel(article.status)}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}
