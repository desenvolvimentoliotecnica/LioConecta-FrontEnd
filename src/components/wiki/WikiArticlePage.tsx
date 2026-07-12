import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useArchiveWikiArticle,
  usePublishWikiArticle,
  useWikiArticle,
} from "../../api/hooks/useWiki";
import {
  WIKI_ARTICLE_STATUS_ARCHIVED,
  WIKI_ARTICLE_STATUS_DRAFT,
  WIKI_ARTICLE_STATUS_PUBLISHED,
  type WikiArticleStatus,
} from "../../api/types";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
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

export function WikiArticlePage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.wiki.manage);

  const articleQuery = useWikiArticle(slug);
  const publishMutation = usePublishWikiArticle();
  const archiveMutation = useArchiveWikiArticle();

  const article = articleQuery.data;
  const busy = publishMutation.isPending || archiveMutation.isPending;

  async function handlePublish() {
    if (!article || busy) return;
    try {
      await publishMutation.mutateAsync(article.id);
    } catch {
      window.alert("Não foi possível publicar o artigo.");
    }
  }

  async function handleArchive() {
    if (!article || busy) return;
    if (!window.confirm("Arquivar este artigo?")) return;
    try {
      await archiveMutation.mutateAsync(article.id);
      navigate("/documentos/wiki");
    } catch {
      window.alert("Não foi possível arquivar o artigo.");
    }
  }

  return (
    <main className={`${sectionMainClass("documentos")} wiki-page`}>
      <SectionPageHead
        section="documentos"
        title={article?.title ?? "Artigo"}
        description={article?.summary || "Artigo da Wiki corporativa."}
        current={article?.title ?? "Artigo"}
        actions={
          <Link to="/documentos/wiki" className="btn btn--ghost">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Voltar à Wiki
          </Link>
        }
      />

      {articleQuery.isLoading ? <p className="wiki-loading">Carregando artigo…</p> : null}
      {articleQuery.isError ? (
        <p className="wiki-error" role="alert">
          Artigo não encontrado ou indisponível.
        </p>
      ) : null}

      {article ? (
        <article className="wiki-shell wiki-reader" style={{ display: "block", padding: "22px 28px" }}>
          <header className="wiki-reader__header">
            <div className="wiki-reader__meta">
              <span>{categoryLabel(article.category)}</span>
              <span>Atualizado em {formatDate(article.updatedAt)}</span>
              {article.authorName ? <span>Por {article.authorName}</span> : null}
              {canManage ? (
                <span className={`wiki-badge ${statusClass(article.status)}`}>
                  {statusLabel(article.status)}
                </span>
              ) : null}
            </div>

            {canManage ? (
              <div className="wiki-reader__actions">
                <Link
                  to={`/documentos/wiki/${encodeURIComponent(article.slug)}/editar`}
                  className="btn btn--ghost"
                >
                  <i className="fa-solid fa-pen" aria-hidden="true" /> Editar
                </Link>
                {article.status !== WIKI_ARTICLE_STATUS_PUBLISHED ? (
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={busy}
                    onClick={() => void handlePublish()}
                  >
                    <i className="fa-solid fa-upload" aria-hidden="true" /> Publicar
                  </button>
                ) : null}
                {article.status !== WIKI_ARTICLE_STATUS_ARCHIVED ? (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={busy}
                    onClick={() => void handleArchive()}
                  >
                    <i className="fa-solid fa-box-archive" aria-hidden="true" /> Arquivar
                  </button>
                ) : null}
              </div>
            ) : null}
          </header>

          <div
            className="wiki-reader__body"
            dangerouslySetInnerHTML={{ __html: article.bodyHtml || "<p></p>" }}
          />
        </article>
      ) : null}
    </main>
  );
}
