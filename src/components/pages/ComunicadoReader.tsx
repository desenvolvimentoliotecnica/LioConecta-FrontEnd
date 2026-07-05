import { Link, useSearchParams } from "react-router-dom";
import { useComunicado } from "../../api/hooks/useComunicados";
import {
  COMUNICADO_KIND_ARQUIVO,
  COMUNICADO_KIND_DEPARTAMENTAL,
  COMUNICADO_KIND_OFICIAL,
  COMUNICADO_KIND_URGENTE,
  type ComunicadoDto,
  type ComunicadoKind,
} from "../../api/types";
import { getComunicadoById } from "../../config/comunicados";
import {
  COMUNICADOS_ARQUIVO_CONFIG,
  COMUNICADOS_DEPARTAMENTAIS_CONFIG,
  COMUNICADOS_OFICIAIS_CONFIG,
  COMUNICADOS_URGENTES_CONFIG,
} from "../../config/comunicados-pages";
import "../../styles/comunicado-reader.css";

type ComunicadoReaderProps = {
  variant?: "default" | "kiosk";
};

function kindMeta(kind: ComunicadoKind): { tag: string; listPath: string; listLabel: string } {
  switch (kind) {
    case COMUNICADO_KIND_DEPARTAMENTAL:
      return {
        tag: "Comunicado departamental",
        listPath: COMUNICADOS_DEPARTAMENTAIS_CONFIG.path,
        listLabel: "Departamentais",
      };
    case COMUNICADO_KIND_URGENTE:
      return {
        tag: "Comunicado urgente",
        listPath: COMUNICADOS_URGENTES_CONFIG.path,
        listLabel: "Urgentes",
      };
    case COMUNICADO_KIND_ARQUIVO:
      return {
        tag: "Arquivo",
        listPath: COMUNICADOS_ARQUIVO_CONFIG.path,
        listLabel: "Arquivo",
      };
    case COMUNICADO_KIND_OFICIAL:
    default:
      return {
        tag: "Comunicado oficial",
        listPath: COMUNICADOS_OFICIAIS_CONFIG.path,
        listLabel: "Oficiais",
      };
  }
}

function formatPublishedDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getApiBodyHtml(content: Record<string, unknown>): string {
  const html = content.html;
  if (typeof html === "string" && html.trim()) {
    return html;
  }
  const text = content.text;
  if (typeof text === "string" && text.trim()) {
    return `<p>${text.replace(/\n/g, "</p><p>")}</p>`;
  }
  return "<p>Conteúdo indisponível.</p>";
}

function ApiComunicadoView({
  comunicado,
  isKiosk,
}: {
  comunicado: ComunicadoDto;
  isKiosk: boolean;
}) {
  const meta = kindMeta(comunicado.kind);
  const heroImage = comunicado.heroImageUrl ?? "/bg-announcement.png";
  const authorAvatar = comunicado.author.photoUrl ?? "/avatar-maria-silva.png";
  const publishedLabel = formatPublishedDate(comunicado.publishedAt);
  const mainClass = isKiosk ? "kiosk-reader" : "main";

  return (
    <main className={mainClass}>
      <article className="comunicado-reader">
        <header className="comunicado-reader__header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {isKiosk ? (
              <>
                <Link to="/quiosque">Quiosque</Link>
                <span className="breadcrumb__sep">/</span>
                <span className="breadcrumb__current">Leitura</span>
              </>
            ) : (
              <>
                <Link to="/">Início</Link>
                <span className="breadcrumb__sep">/</span>
                <Link to={COMUNICADOS_OFICIAIS_CONFIG.path}>Comunicados</Link>
                <span className="breadcrumb__sep">/</span>
                <Link to={meta.listPath}>{meta.listLabel}</Link>
                <span className="breadcrumb__sep">/</span>
                <span className="breadcrumb__current">Leitura</span>
              </>
            )}
          </nav>
        </header>

        <div className="comunicado-reader__panel">
          <div className="comunicado-reader__hero" aria-hidden="true">
            <img src={heroImage} alt="" />
          </div>

          <div className="comunicado-reader__content">
            <div className="comunicado-reader__meta">
              <span className="tag">{meta.tag}</span>
              {publishedLabel ? (
                <time className="comunicado-reader__date" dateTime={comunicado.publishedAt ?? undefined}>
                  {publishedLabel}
                </time>
              ) : null}
              <div className="comunicado-reader__author">
                <img className="avatar" src={authorAvatar} alt="" />
                {comunicado.author.name}
              </div>
            </div>

            <h1 className="comunicado-reader__title">{comunicado.title}</h1>

            {comunicado.excerpt ? (
              <p className="comunicado-reader__excerpt">{comunicado.excerpt}</p>
            ) : null}

            <div
              className="comunicado-reader__body"
              dangerouslySetInnerHTML={{ __html: getApiBodyHtml(comunicado.content) }}
            />

            <footer className="comunicado-reader__footer">
              <Link className="comunicado-reader__back" to={isKiosk ? "/quiosque" : meta.listPath}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />{" "}
                {isKiosk ? "Voltar ao quiosque" : `Voltar para ${meta.listLabel}`}
              </Link>
              {!isKiosk ? (
                <div className="comunicado-reader__actions">
                  <button type="button" className="comunicado-reader__action">
                    <i className="fa-regular fa-thumbs-up" aria-hidden="true" /> Curtir
                  </button>
                  <button type="button" className="comunicado-reader__action">
                    <i className="fa-regular fa-share-from-square" aria-hidden="true" /> Compartilhar
                  </button>
                </div>
              ) : null}
            </footer>
          </div>
        </div>
      </article>
    </main>
  );
}

export function ComunicadoReader({ variant = "default" }: ComunicadoReaderProps) {
  const [params] = useSearchParams();
  const id = params.get("id")?.trim() ?? "";
  const isKiosk = variant === "kiosk";
  const mainClass = isKiosk ? "kiosk-reader" : "main";
  const apiQuery = useComunicado(id);
  const staticComunicado = id && apiQuery.isError ? getComunicadoById(id) : undefined;

  if (id) {
    if (apiQuery.isLoading) {
      return (
        <main className={mainClass}>
          <div className="comunicado-reader comunicado-reader--empty">
            <p>Carregando comunicado...</p>
          </div>
        </main>
      );
    }

    if (apiQuery.data) {
      return <ApiComunicadoView comunicado={apiQuery.data} isKiosk={isKiosk} />;
    }
  }

  if (!staticComunicado) {
    return (
      <main className={mainClass}>
        <div className="comunicado-reader comunicado-reader--empty">
          <h1>Comunicado não encontrado</h1>
          <p>Não localizamos o comunicado solicitado. Verifique o link ou volte para a listagem.</p>
          <Link className="comunicado-reader__back" to={isKiosk ? "/quiosque" : COMUNICADOS_OFICIAIS_CONFIG.path}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />{" "}
            {isKiosk ? "Voltar ao quiosque" : "Ver comunicados oficiais"}
          </Link>
        </div>
      </main>
    );
  }

  const tagClass = staticComunicado.tagClass ? ` ${staticComunicado.tagClass}` : "";

  return (
    <main className={mainClass}>
      <article className="comunicado-reader">
        <header className="comunicado-reader__header">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            {isKiosk ? (
              <>
                <Link to="/quiosque">Quiosque</Link>
                <span className="breadcrumb__sep">/</span>
                <span className="breadcrumb__current">Leitura</span>
              </>
            ) : (
              <>
                <Link to="/">Início</Link>
                <span className="breadcrumb__sep">/</span>
                <Link to={COMUNICADOS_OFICIAIS_CONFIG.path}>Comunicados</Link>
                <span className="breadcrumb__sep">/</span>
                <Link to={staticComunicado.listPath}>{staticComunicado.listLabel}</Link>
                <span className="breadcrumb__sep">/</span>
                <span className="breadcrumb__current">Leitura</span>
              </>
            )}
          </nav>
        </header>

        <div className="comunicado-reader__panel">
          <div className="comunicado-reader__hero" aria-hidden="true">
            <img src={staticComunicado.heroImage} alt="" />
          </div>

          <div className="comunicado-reader__content">
            <div className="comunicado-reader__meta">
              <span className={`tag${tagClass}`}>{staticComunicado.tag}</span>
              <time className="comunicado-reader__date" dateTime={staticComunicado.date}>
                {staticComunicado.date}
              </time>
              <div className="comunicado-reader__author">
                <img className="avatar" src={staticComunicado.authorAvatar} alt="" />
                {staticComunicado.author}
              </div>
            </div>

            <h1 className="comunicado-reader__title">{staticComunicado.title}</h1>

            <div className="comunicado-reader__body">
              {staticComunicado.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <footer className="comunicado-reader__footer">
              <Link className="comunicado-reader__back" to={isKiosk ? "/quiosque" : staticComunicado.listPath}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />{" "}
                {isKiosk ? "Voltar ao quiosque" : `Voltar para ${staticComunicado.listLabel}`}
              </Link>
              {!isKiosk ? (
                <div className="comunicado-reader__actions">
                  <button type="button" className="comunicado-reader__action">
                    <i className="fa-regular fa-thumbs-up" aria-hidden="true" /> Curtir
                  </button>
                  <button type="button" className="comunicado-reader__action">
                    <i className="fa-regular fa-share-from-square" aria-hidden="true" /> Compartilhar
                  </button>
                </div>
              ) : null}
            </footer>
          </div>
        </div>
      </article>
    </main>
  );
}
