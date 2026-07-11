import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCreateComunicado } from "../../api/hooks/useComunicados";
import {
  COMUNICADO_AUDIENCE_ALL,
  COMUNICADO_AUDIENCE_DEPARTMENTS,
  COMUNICADO_STATUS_DRAFT,
  COMUNICADO_STATUS_PUBLISHED,
  COMUNICADO_STATUS_SCHEDULED,
  type ComunicadoAudienceType,
} from "../../api/types";
import { useOrgChartDepartments } from "../../api/hooks/useOrgChartGovernance";
import { ComunicadoHeroImagePicker } from "../comunicados/ComunicadoHeroImagePicker";
import {
  type ComunicadosPageConfig,
  comunicadoReaderId,
  injectComunicadosPageStyles,
} from "../../config/comunicados-pages";
import "../../styles/comunicado-editor.css";

type ToastState = { type: "success" | "error"; message: string } | null;

type ComunicadoEditorPageProps = {
  config: ComunicadosPageConfig;
};

function execFormat(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function ComunicadoEditorPage({ config }: ComunicadoEditorPageProps) {
  const navigate = useNavigate();
  const createComunicado = useCreateComunicado();
  const departmentsQuery = useOrgChartDepartments();
  const bodyRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [isMandatory, setIsMandatory] = useState(config.mandatoryDefault ?? false);
  const [audienceType, setAudienceType] = useState<ComunicadoAudienceType>(COMUNICADO_AUDIENCE_ALL);
  const [audienceDepartmentIds, setAudienceDepartmentIds] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const canPublish = title.trim().length > 0;
  const isPublishing = createComunicado.isPending;

  useEffect(() => injectComunicadosPageStyles(config.pageId), [config.pageId]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4500);
  }

  function handleLink() {
    const url = window.prompt("URL do link:");
    if (url?.trim()) {
      execFormat("createLink", url.trim());
    }
    bodyRef.current?.focus();
  }

  async function submit(status: typeof COMUNICADO_STATUS_DRAFT | typeof COMUNICADO_STATUS_SCHEDULED | typeof COMUNICADO_STATUS_PUBLISHED) {
    if (!canPublish || isPublishing) return;

    const html = bodyRef.current?.innerHTML.trim() ?? "";
    const plainText = bodyRef.current?.innerText.trim() ?? "";

    if (!plainText) {
      showToast("error", "Escreva o conteúdo do comunicado antes de publicar.");
      bodyRef.current?.focus();
      return;
    }

    try {
      const result = await createComunicado.mutateAsync({
        kind: config.kind,
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: { html },
        heroImageUrl: heroImageUrl.trim() || null,
        isMandatory,
          status,
          scheduledAt: status === COMUNICADO_STATUS_SCHEDULED ? new Date(scheduledAt).toISOString() : null,
          audienceType,
          audienceDepartmentIds: audienceType === COMUNICADO_AUDIENCE_DEPARTMENTS ? audienceDepartmentIds : null,
      });

      showToast("success", status === COMUNICADO_STATUS_DRAFT ? "Rascunho salvo com sucesso!" : status === COMUNICADO_STATUS_SCHEDULED ? "Comunicado agendado com sucesso!" : "Comunicado publicado com sucesso!");
      window.setTimeout(() => {
        navigate(`/comunicados/leitura?id=${encodeURIComponent(comunicadoReaderId(result))}`);
      }, 600);
    } catch {
      showToast("error", "Não foi possível publicar. Verifique permissões e tente novamente.");
    }
  }

  function handlePublish() {
    void submit(COMUNICADO_STATUS_PUBLISHED);
  }

  return (
    <main className="main comunicado-editor">
      {toast && (
        <div
          className={`comunicado-editor__toast comunicado-editor__toast--${toast.type}`}
          role="status"
        >
          <i
            className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}
            aria-hidden="true"
          />
          {toast.message}
        </div>
      )}

      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/comunicados">Comunicados</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to={config.path}>{config.breadcrumbCurrent}</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Novo</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">{config.editorTitle}</h1>
            <p className="page-header__desc">{config.editorDescription}</p>
          </div>
        </div>
      </header>

      <div className="comunicado-editor__layout">
        <section className="comunicado-editor__main" aria-label="Editor">
          <input
            className="comunicado-editor__title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título do comunicado"
            aria-label="Título do comunicado"
            maxLength={200}
          />

          <textarea
            className="comunicado-editor__excerpt"
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="Resumo curto (aparece na listagem e cards)"
            aria-label="Resumo do comunicado"
            maxLength={500}
          />

          <div className="comunicado-editor__canvas">
            <div className="comunicado-editor__toolbar" role="toolbar" aria-label="Formatação">
              <button
                type="button"
                className="comunicado-editor__tool"
                title="Negrito"
                aria-label="Negrito"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => execFormat("bold")}
              >
                <i className="fa-solid fa-bold" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="comunicado-editor__tool"
                title="Itálico"
                aria-label="Itálico"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => execFormat("italic")}
              >
                <i className="fa-solid fa-italic" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="comunicado-editor__tool"
                title="Título"
                aria-label="Título"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => execFormat("formatBlock", "h2")}
              >
                <i className="fa-solid fa-heading" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="comunicado-editor__tool"
                title="Lista com marcadores"
                aria-label="Lista com marcadores"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => execFormat("insertUnorderedList")}
              >
                <i className="fa-solid fa-list-ul" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="comunicado-editor__tool"
                title="Lista numerada"
                aria-label="Lista numerada"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => execFormat("insertOrderedList")}
              >
                <i className="fa-solid fa-list-ol" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="comunicado-editor__tool"
                title="Link"
                aria-label="Inserir link"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleLink}
              >
                <i className="fa-solid fa-link" aria-hidden="true" />
              </button>
            </div>

            <div
              ref={bodyRef}
              className="comunicado-editor__body"
              contentEditable
              role="textbox"
              aria-multiline="true"
              aria-label="Conteúdo do comunicado"
              data-placeholder="Comece a escrever o comunicado..."
              suppressContentEditableWarning
            />
          </div>
        </section>

        <aside className="comunicado-editor__sidebar" aria-label="Publicação">
          <div className="comunicado-editor__panel">
            <div className="comunicado-editor__panel-header">Publicar</div>
            <div className="comunicado-editor__panel-body">
              <div className="comunicado-editor__actions">
                <button type="button" className="comunicado-editor__secondary" onClick={() => void submit(COMUNICADO_STATUS_DRAFT)} disabled={!canPublish || isPublishing}>
                  Salvar rascunho
                </button>
                <label className="comunicado-editor__schedule">
                  Agendar
                  <input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
                  <button type="button" className="comunicado-editor__secondary" onClick={() => void submit(COMUNICADO_STATUS_SCHEDULED)} disabled={!canPublish || !scheduledAt || isPublishing}>Confirmar</button>
                </label>
                <button
                  type="button"
                  className="comunicado-editor__publish"
                  onClick={() => void handlePublish()}
                  disabled={!canPublish || isPublishing}
                >
                  {isPublishing ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                      Publicar agora
                    </>
                  )}
                </button>
                <Link to={config.path} className="comunicado-editor__secondary">
                  Cancelar
                </Link>
              </div>
            </div>
          </div>

          <div className="comunicado-editor__panel">
            <div className="comunicado-editor__panel-header">Imagem de destaque</div>
            <div className="comunicado-editor__panel-body">
              <ComunicadoHeroImagePicker
                value={heroImageUrl}
                onChange={setHeroImageUrl}
              />
            </div>
          </div>

          <div className="comunicado-editor__panel">
            <div className="comunicado-editor__panel-header">Público</div>
            <div className="comunicado-editor__panel-body">
              <label className="comunicado-editor__checkbox">
                <input type="radio" checked={audienceType === COMUNICADO_AUDIENCE_ALL} onChange={() => setAudienceType(COMUNICADO_AUDIENCE_ALL)} />
                <span>Todos os colaboradores</span>
              </label>
              <label className="comunicado-editor__checkbox">
                <input type="radio" checked={audienceType === COMUNICADO_AUDIENCE_DEPARTMENTS} onChange={() => setAudienceType(COMUNICADO_AUDIENCE_DEPARTMENTS)} />
                <span>Departamentos selecionados</span>
              </label>
              {audienceType === COMUNICADO_AUDIENCE_DEPARTMENTS ? (
                <select multiple value={audienceDepartmentIds} onChange={(event) => setAudienceDepartmentIds(Array.from(event.currentTarget.selectedOptions, (option) => option.value))} aria-label="Departamentos destinatários">
                  {(departmentsQuery.data ?? []).filter((department) => department.isActive).map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </select>
              ) : null}
            </div>
          </div>

          <div className="comunicado-editor__panel">
            <div className="comunicado-editor__panel-header">Opções</div>
            <div className="comunicado-editor__panel-body">
              <label className="comunicado-editor__checkbox">
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(event) => setIsMandatory(event.target.checked)}
                />
                <span>Leitura obrigatória — exige confirmação de leitura pelos colaboradores</span>
              </label>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
