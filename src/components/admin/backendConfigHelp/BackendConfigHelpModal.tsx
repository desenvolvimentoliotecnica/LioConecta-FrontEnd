import type { ReactNode } from "react";
import { ContrachequeModal } from "../../contracheque/ContrachequeModal";
import { BACKEND_CONFIG_HELP, hasBackendConfigHelp } from "./content";
import type { BackendConfigHelpContext } from "./helpParts";

type Props = {
  categoryId: string | null;
  open: boolean;
  onClose: () => void;
  portalOrigin?: string;
};

function buildHelpContext(portalOrigin?: string): BackendConfigHelpContext {
  const portal = portalOrigin ?? (typeof window !== "undefined" ? window.location.origin : "https://seu-portal");
  const dev = portal.includes("localhost") ? portal : "http://localhost:5173";
  return { portalOrigin: portal, devOrigin: dev };
}

export function BackendConfigHelpModal({ categoryId, open, onClose, portalOrigin }: Props) {
  if (!categoryId || !hasBackendConfigHelp(categoryId)) {
    return null;
  }

  const entry = BACKEND_CONFIG_HELP[categoryId];
  const ctx = buildHelpContext(portalOrigin);

  return (
    <ContrachequeModal
      open={open}
      title={entry.title}
      wide
      onClose={onClose}
      footer={
        <button type="button" className="pay-modal__btn" onClick={onClose}>
          Entendi
        </button>
      }
    >
      <div className="backend-config-page__help">{entry.render(ctx)}</div>
    </ContrachequeModal>
  );
}

type SectionHeadProps = {
  titleId: string;
  title: string;
  description?: ReactNode;
  helpCategoryId?: string | null;
  onOpenHelp: (categoryId: string) => void;
};

export function ConfigSectionHead({
  titleId,
  title,
  description,
  helpCategoryId,
  onOpenHelp,
}: SectionHeadProps) {
  const showHelp = helpCategoryId && hasBackendConfigHelp(helpCategoryId);

  return (
    <div
      className={`backend-config-page__section-head${showHelp ? " backend-config-page__section-head--with-help" : ""}`}
    >
      <div className="backend-config-page__section-head-text">
        <h2 id={titleId} className="backend-config-page__section-title">
          {title}
        </h2>
        {description ? <p className="backend-config-page__section-desc">{description}</p> : null}
      </div>
      {showHelp ? (
        <button
          type="button"
          className="backend-config-page__help-btn"
          onClick={() => onOpenHelp(helpCategoryId)}
          aria-label={`Ajuda sobre ${title}`}
        >
          <i className="fa-regular fa-circle-question" aria-hidden="true" />
          Ajuda
        </button>
      ) : null}
    </div>
  );
}
