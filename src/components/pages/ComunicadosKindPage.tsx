import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { type ComunicadosPageConfig, injectComunicadosPageStyles } from "../../config/comunicados-pages";
import { getPageById } from "../../config/routes";
import { usePageScript } from "../../hooks/usePageScript";
import { ComunicadosList, ComunicadosListToolbar } from "../comunicados/ComunicadosList";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
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
    <main className={sectionMainClass("comunicados")} ref={mainRef}>
      <SectionPageHead
        section="comunicados"
        title={config.title}
        current={config.breadcrumbCurrent}
        description={config.description}
        actions={
          config.showCreateButton && config.createPath ? (
            <Link to={config.createPath} className="comunicados-oficiais__create-btn">
              <i className="fa-solid fa-plus" aria-hidden="true" />
              Novo comunicado
            </Link>
          ) : undefined
        }
        toolbar={<ComunicadosListToolbar config={config} />}
      />

      <ComunicadosList config={config} showToolbar={false} />
    </main>
  );
}
