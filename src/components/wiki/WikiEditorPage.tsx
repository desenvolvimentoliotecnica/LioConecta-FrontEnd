import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useCreateWikiArticle,
  useUpdateWikiArticle,
  useWikiArticle,
} from "../../api/hooks/useWiki";
import {
  WIKI_ARTICLE_STATUS_DRAFT,
  WIKI_ARTICLE_STATUS_PUBLISHED,
} from "../../api/types";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { usePermissions } from "../../hooks/usePermissions";
import { RichTextEditor } from "../email/RichTextEditor";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/wiki-page.css";

const CATEGORIES = [
  { id: "acesso", label: "Acesso" },
  { id: "hardware", label: "Hardware" },
  { id: "software", label: "Software" },
] as const;

type ToastState = { type: "success" | "error"; message: string } | null;

export function WikiEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.wiki.manage);

  const articleQuery = useWikiArticle(slug ?? "");
  const createMutation = useCreateWikiArticle();
  const updateMutation = useUpdateWikiArticle();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<string>("acesso");
  const [bodyHtml, setBodyHtml] = useState("<p></p>");
  const [hydrated, setHydrated] = useState(!isEdit);
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!isEdit || !articleQuery.data || hydrated) return;
    setTitle(articleQuery.data.title);
    setSummary(articleQuery.data.summary ?? "");
    setCategory(articleQuery.data.category || "acesso");
    setBodyHtml(articleQuery.data.bodyHtml || "<p></p>");
    setHydrated(true);
  }, [articleQuery.data, hydrated, isEdit]);

  const busy = createMutation.isPending || updateMutation.isPending;
  const canSave = title.trim().length > 0 && category.trim().length > 0 && !busy;

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4000);
  }

  async function save(publish: boolean) {
    if (!canSave) return;

    const plain = bodyHtml.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    if (!plain) {
      showToast("error", "Escreva o conteúdo do artigo antes de salvar.");
      return;
    }

    try {
      if (isEdit && articleQuery.data) {
        const updated = await updateMutation.mutateAsync({
          id: articleQuery.data.id,
          body: {
            title: title.trim(),
            summary: summary.trim() || null,
            category,
            bodyHtml,
          },
        });
        showToast("success", "Artigo atualizado.");
        window.setTimeout(() => {
          navigate(`/documentos/wiki/${encodeURIComponent(updated.slug)}`);
        }, 400);
        return;
      }

      const created = await createMutation.mutateAsync({
        title: title.trim(),
        summary: summary.trim() || null,
        category,
        bodyHtml,
        status: publish ? WIKI_ARTICLE_STATUS_PUBLISHED : WIKI_ARTICLE_STATUS_DRAFT,
      });
      showToast("success", publish ? "Artigo publicado." : "Rascunho salvo.");
      window.setTimeout(() => {
        navigate(`/documentos/wiki/${encodeURIComponent(created.slug)}`);
      }, 400);
    } catch {
      showToast("error", "Não foi possível salvar. Verifique permissões e tente novamente.");
    }
  }

  if (!canManage) {
    return (
      <main className={`${sectionMainClass("documentos")} wiki-page`}>
        <SectionPageHead
          section="documentos"
          title="Wiki"
          description="Você não tem permissão para gerenciar artigos."
          current="Wiki"
        />
        <p className="wiki-error" role="alert">
          Permissão <code>wiki.manage</code> necessária.
        </p>
        <Link to="/documentos/wiki" className="btn btn--ghost">
          Voltar
        </Link>
      </main>
    );
  }

  if (isEdit && articleQuery.isLoading) {
    return (
      <main className={`${sectionMainClass("documentos")} wiki-page`}>
        <p className="wiki-loading">Carregando artigo…</p>
      </main>
    );
  }

  if (isEdit && articleQuery.isError) {
    return (
      <main className={`${sectionMainClass("documentos")} wiki-page`}>
        <p className="wiki-error" role="alert">
          Artigo não encontrado.
        </p>
        <Link to="/documentos/wiki" className="btn btn--ghost">
          Voltar
        </Link>
      </main>
    );
  }

  return (
    <main className={`${sectionMainClass("documentos")} wiki-page`}>
      <SectionPageHead
        section="documentos"
        title={isEdit ? "Editar artigo" : "Novo artigo"}
        description="Título, resumo, categoria e conteúdo em rich text."
        current={isEdit ? "Editar" : "Novo artigo"}
        actions={
          <Link to="/documentos/wiki" className="btn btn--ghost">
            Cancelar
          </Link>
        }
      />

      {toast ? (
        <p className={toast.type === "error" ? "wiki-error" : "wiki-loading"} role="status">
          {toast.message}
        </p>
      ) : null}

      <div className="wiki-shell" style={{ display: "block", padding: "22px 28px" }}>
        <form
          className="wiki-editor"
          onSubmit={(e) => {
            e.preventDefault();
            void save(false);
          }}
        >
          <label className="wiki-editor__field">
            <span className="wiki-editor__label">Título</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: VPN instável ou desconectando"
              required
            />
          </label>

          <label className="wiki-editor__field">
            <span className="wiki-editor__label">Resumo</span>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Uma frase sobre o que o artigo resolve"
            />
          </label>

          <label className="wiki-editor__field">
            <span className="wiki-editor__label">Categoria</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <div className="wiki-editor__field">
            <span className="wiki-editor__label">Conteúdo</span>
            {hydrated ? (
              <RichTextEditor
                value={bodyHtml}
                onChange={setBodyHtml}
                placeholder="Escreva o artigo…"
                minHeight={280}
                enableHeadings
                disabled={busy}
              />
            ) : null}
          </div>

          <div className="wiki-editor__actions">
            <button
              type="submit"
              className="btn btn--ghost"
              disabled={!canSave}
            >
              Salvar rascunho
            </button>
            {!isEdit ? (
              <button
                type="button"
                className="btn btn--primary"
                disabled={!canSave}
                onClick={() => void save(true)}
              >
                Publicar
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--primary"
                disabled={!canSave}
                onClick={() => void save(false)}
              >
                Salvar alterações
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
