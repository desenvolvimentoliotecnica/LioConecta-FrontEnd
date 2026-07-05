import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { type ComunicadosPageConfig, injectComunicadosPageStyles } from "../../config/comunicados-pages";
import { getPageById } from "../../config/routes";
import { usePageScript } from "../../hooks/usePageScript";
import { ComunicadosList } from "../comunicados/ComunicadosList";
import "../../styles/comunicados-oficiais-page.css";

type ComunicadosKindPageProps = {
  config: ComunicadosPageConfig;
};

export function ComunicadosKindPage({ config }: ComunicadosKindPageProps) {
  const mainRef = useRef<HTMLElement>(null);
  const page = getPageById(config.pageId);

  usePageScript(page, config.path);
  useEffect(() => injectComunicadosPageStyles(config.pageId), [config.pageId]);

  return (
    <main className="main" ref={mainRef}>
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <Link to="/comunicados">Comunicados</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">{config.breadcrumbCurrent}</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">{config.title}</h1>
            <p className="page-header__desc">{config.description}</p>
          </div>
          {config.showCreateButton && config.createPath ? (
            <Link to={config.createPath} className="comunicados-oficiais__create-btn">
              <i className="fa-solid fa-plus" aria-hidden="true" />
              Novo comunicado
            </Link>
          ) : null}
        </div>
      </header>

      <ComunicadosList config={config} />
    </main>
  );
}
