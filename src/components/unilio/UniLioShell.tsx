import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useUniLioCompliance } from "../../api/hooks/useUniLioCompliance";
import { useUniLioMeta } from "../../api/hooks/useUniLioMeta";
import { useMe } from "../../api/hooks/useMe";
import { PERSONA_LABELS } from "../../config/unilio/constants";
import { useModuleFocus } from "../../context/ModuleFocusContext";
import { resolveUniLioPersona } from "../../utils/unilioView";
import { ModuleFocusButton } from "../shared/ModuleFocusButton";
import { UniLioFallbackBanner } from "./UniLioFallbackBanner";
import { UniLioFilterBar } from "./UniLioFilterBar";
import { UniLioNav } from "./UniLioNav";
import "../../styles/unilio-shell.css";

export function UniLioShell() {
  const playerMatch = useMatch("/unilio/curso/:courseId");
  const catalogMatch = useMatch("/unilio/catalogo");
  const authoringMatch = useMatch("/unilio/instrutor/curso/:courseId/editar");
  const approvalMatch = useMatch("/unilio/admin/aprovacoes/:courseId");
  const isPlayerView = Boolean(playerMatch);
  const isCatalogView = Boolean(catalogMatch);
  const isAuthoringFocus = Boolean(authoringMatch || approvalMatch);
  const isFocusView = isPlayerView || isAuthoringFocus;
  const [navCollapsed, setNavCollapsed] = useState(isFocusView);
  const { focusMode, setFocusMode } = useModuleFocus();
  const { data: me } = useMe();
  const { data: meta, isFallback: metaFallback } = useUniLioMeta();
  const { data: compliance, isFallback: complianceFallback } = useUniLioCompliance();
  const persona = useMemo(() => resolveUniLioPersona(me, meta), [me, meta]);

  useEffect(() => {
    if (isFocusView) {
      setNavCollapsed(true);
      setFocusMode(true);
      return;
    }
    setFocusMode(false);
  }, [isFocusView, setFocusMode]);

  useEffect(() => {
    if (focusMode && !isFocusView) {
      setNavCollapsed(true);
    }
  }, [focusMode, isFocusView]);

  const isFallback = metaFallback || complianceFallback;
  const navIsCollapsed = isFocusView || navCollapsed || focusMode;

  return (
    <div
      className={`unilio-shell${navIsCollapsed ? " unilio-shell--nav-collapsed" : ""}${focusMode || isFocusView ? " unilio-shell--module-focus" : ""}${isPlayerView ? " unilio-shell--player-focus" : ""}${isAuthoringFocus ? " unilio-shell--authoring-focus" : ""}`}
    >
      <UniLioNav
        collapsed={navIsCollapsed}
        onToggle={() => setNavCollapsed((c) => !c)}
        persona={persona.persona}
        complianceBadge={compliance.overdueCount}
        minimal={isFocusView}
      />

      <div className="unilio-shell__main">
        {!isFocusView ? (
          <header className="unilio-shell__header">
            <div className="unilio-shell__header-top">
              <nav className="breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Início</Link>
                <span className="breadcrumb__sep">/</span>
                <span className="breadcrumb__current">UniLio</span>
              </nav>
              <div className="unilio-shell__header-actions">
                <span className="unilio-shell__badge">
                  <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
                  Portal de Aprendizagem
                </span>
                <ModuleFocusButton />
                <span className="unilio-shell__persona" title={PERSONA_LABELS[persona.persona]}>
                  <i className="fa-solid fa-user-tag" aria-hidden="true" />
                  {persona.label}
                </span>
              </div>
            </div>

            <UniLioFallbackBanner show={isFallback} />

            {!isCatalogView ? <UniLioFilterBar /> : null}
          </header>
        ) : null}

        <Outlet context={{ persona, meta, isFallback }} />
      </div>
    </div>
  );
}
