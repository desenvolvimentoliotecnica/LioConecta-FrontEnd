import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  PAGE_HEAD_SECTIONS,
  type PageHeadSection,
  sectionMainClass,
} from "../../config/page-head";
import "../../styles/section-page-head.css";

export type SectionPageHeadProps = {
  section: PageHeadSection;
  title: string;
  description: string;
  /** Leaf page label in breadcrumb. Omit for hub root pages. */
  current?: string;
  /** Optional sync/status line below the description (e.g. RM syncedAt). */
  syncMeta?: ReactNode;
  /** Search / filters row (barra de busca | filtros). */
  toolbar?: ReactNode;
  /** Optional action button aligned with the subtitle row. */
  actions?: ReactNode;
};

type SphCssVars = CSSProperties & {
  ["--sph-watermark"]?: string;
};

/**
 * Standard section header (padrão /pessoas/diretorio):
 * Breadcrumb → Título → Subtítulo | Botão → hr → busca | filtros
 * Min-height via `.section-page-head` CSS (cresce se a toolbar precisar).
 */
export function SectionPageHead({
  section,
  title,
  description,
  current,
  syncMeta,
  toolbar,
  actions,
}: SectionPageHeadProps) {
  const meta = PAGE_HEAD_SECTIONS[section];
  const watermark = meta.watermark;
  const style: SphCssVars | undefined = watermark
    ? { ["--sph-watermark"]: `url("${watermark}")` }
    : undefined;

  return (
    <div
      className={[
        "section-page-head",
        `section-page-head--${section}`,
        watermark ? "section-page-head--watermark" : "",
        toolbar ? "section-page-head--has-toolbar" : "section-page-head--no-toolbar",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <header className={`page-header page-header--${section}`}>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          {current ? (
            <>
              {meta.hubPath ? (
                <Link to={meta.hubPath}>{meta.hubLabel}</Link>
              ) : (
                <span>{meta.hubLabel}</span>
              )}
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">{current}</span>
            </>
          ) : (
            <span className="breadcrumb__current">{meta.hubLabel}</span>
          )}
        </nav>

        <h1 className="page-header__title">{title}</h1>

        <div className="page-header__subtitle-row">
          <div className="page-header__subtitle">
            <p className="page-header__desc">{description}</p>
            {syncMeta ? <p className="page-header__sync-meta">{syncMeta}</p> : null}
          </div>
          {actions ? <div className="page-header__actions">{actions}</div> : null}
        </div>
      </header>

      <hr className="section-page-head__rule" />

      <div className="section-page-head__toolbar">{toolbar}</div>
    </div>
  );
}

export { sectionMainClass };
