import type { ReactNode } from "react";
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
  toolbar?: ReactNode;
  actions?: ReactNode;
};

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

  return (
    <div className={`section-page-head section-page-head--${section}`}>
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
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">{title}</h1>
            <p className="page-header__desc">{description}</p>
            {syncMeta ? <p className="page-header__sync-meta">{syncMeta}</p> : null}
          </div>
          {actions}
        </div>
      </header>
      {toolbar}
    </div>
  );
}

export { sectionMainClass };
