import { Link, useSearchParams } from "react-router-dom";
import { getComunicadoById } from "../../config/comunicados";
import "../../styles/comunicado-reader.css";

type ComunicadoReaderProps = {
  variant?: "default" | "kiosk";
};

export function ComunicadoReader({ variant = "default" }: ComunicadoReaderProps) {
  const [params] = useSearchParams();
  const id = params.get("id")?.trim() ?? "";
  const comunicado = id ? getComunicadoById(id) : undefined;
  const isKiosk = variant === "kiosk";
  const mainClass = isKiosk ? "kiosk-reader" : "main";

  if (!comunicado) {
    return (
      <main className={mainClass}>
        <div className="comunicado-reader comunicado-reader--empty">
          <h1>Comunicado não encontrado</h1>
          <p>Não localizamos o comunicado solicitado. Verifique o link ou volte para a listagem.</p>
          <Link className="comunicado-reader__back" to={isKiosk ? "/quiosque" : "/comunicados/oficiais"}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />{" "}
            {isKiosk ? "Voltar ao quiosque" : "Ver comunicados oficiais"}
          </Link>
        </div>
      </main>
    );
  }

  const tagClass = comunicado.tagClass ? ` ${comunicado.tagClass}` : "";

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
                <Link to="/comunicados/oficiais">Comunicados</Link>
                <span className="breadcrumb__sep">/</span>
                <Link to={comunicado.listPath}>{comunicado.listLabel}</Link>
                <span className="breadcrumb__sep">/</span>
                <span className="breadcrumb__current">Leitura</span>
              </>
            )}
          </nav>
        </header>

        <div className="comunicado-reader__panel">
          <div className="comunicado-reader__hero" aria-hidden="true">
            <img src={comunicado.heroImage} alt="" />
          </div>

          <div className="comunicado-reader__content">
            <div className="comunicado-reader__meta">
              <span className={`tag${tagClass}`}>{comunicado.tag}</span>
              <time className="comunicado-reader__date" dateTime={comunicado.date}>
                {comunicado.date}
              </time>
              <div className="comunicado-reader__author">
                <img className="avatar" src={comunicado.authorAvatar} alt="" />
                {comunicado.author}
              </div>
            </div>

            <h1 className="comunicado-reader__title">{comunicado.title}</h1>

            <div className="comunicado-reader__body">
              {comunicado.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <footer className="comunicado-reader__footer">
              <Link className="comunicado-reader__back" to={isKiosk ? "/quiosque" : comunicado.listPath}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" />{" "}
                {isKiosk ? "Voltar ao quiosque" : `Voltar para ${comunicado.listLabel}`}
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
