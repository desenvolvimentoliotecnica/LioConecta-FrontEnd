import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useMatch } from "react-router-dom";
import { useUniLioCompliance } from "../../api/hooks/useUniLioCompliance";
import { useUniLioMeta } from "../../api/hooks/useUniLioMeta";
import { useMe } from "../../api/hooks/useMe";
import { PERSONA_LABELS, UNILIO_PERIODS } from "../../config/unilio/constants";
import { useModuleFocus } from "../../context/ModuleFocusContext";
import { resolveUniLioPersona } from "../../utils/unilioView";
import { ModuleFocusButton } from "../shared/ModuleFocusButton";
import { useUniLioFilters } from "./UniLioAccessGate";
import { UniLioFallbackBanner } from "./UniLioFallbackBanner";
import { UniLioNav } from "./UniLioNav";
import "../../styles/unilio-shell.css";

export function UniLioShell() {
  const playerMatch = useMatch("/unilio/curso/:courseId");
  const isPlayerView = Boolean(playerMatch);
  const [navCollapsed, setNavCollapsed] = useState(isPlayerView);
  const { focusMode, setFocusMode } = useModuleFocus();
  const { filters, setArea, setDepartment, setContentType, setSearch, setPeriod, resetFilters } =
    useUniLioFilters();
  const { data: me } = useMe();
  const { data: meta, isFallback: metaFallback } = useUniLioMeta();
  const { data: compliance, isFallback: complianceFallback } = useUniLioCompliance();
  const persona = useMemo(() => resolveUniLioPersona(me, meta), [me, meta]);

  useEffect(() => {
    if (isPlayerView) {
      setNavCollapsed(true);
      setFocusMode(true);
      return;
    }
    setFocusMode(false);
  }, [isPlayerView, setFocusMode]);

  useEffect(() => {
    if (focusMode && !isPlayerView) {
      setNavCollapsed(true);
    }
  }, [focusMode, isPlayerView]);

  const isFallback = metaFallback || complianceFallback;
  const navIsCollapsed = isPlayerView || navCollapsed || focusMode;

  return (
    <div
      className={`unilio-shell${navIsCollapsed ? " unilio-shell--nav-collapsed" : ""}${focusMode || isPlayerView ? " unilio-shell--module-focus" : ""}${isPlayerView ? " unilio-shell--player-focus" : ""}`}
    >
      <UniLioNav
        collapsed={navIsCollapsed}
        onToggle={() => setNavCollapsed((c) => !c)}
        persona={persona.persona}
        complianceBadge={compliance.overdueCount}
        minimal={isPlayerView}
      />

      <div className="unilio-shell__main">
        {!isPlayerView ? (
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

            <div className="unilio-shell__toolbar">
              <div className="unilio-shell__search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Buscar curso, trilha, competência…"
                  value={filters.search ?? ""}
                  onChange={(e) => setSearch(e.target.value || undefined)}
                  aria-label="Busca no UniLio"
                />
              </div>

              <div className="unilio-shell__filters">
                <select
                  className="unilio-shell__select"
                  value={filters.area ?? ""}
                  onChange={(e) => setArea(e.target.value || undefined)}
                  aria-label="Filtrar por área"
                >
                  <option value="">Todas as áreas</option>
                  {meta.areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>

                <select
                  className="unilio-shell__select"
                  value={filters.department ?? ""}
                  onChange={(e) => setDepartment(e.target.value || undefined)}
                  aria-label="Filtrar por departamento"
                >
                  <option value="">Todos os departamentos</option>
                  {meta.departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  className="unilio-shell__select"
                  value={filters.contentType ?? ""}
                  onChange={(e) => setContentType(e.target.value || undefined)}
                  aria-label="Filtrar por tipo de conteúdo"
                >
                  <option value="">Todos os tipos</option>
                  {meta.contentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <select
                  className="unilio-shell__select"
                  value={filters.period ?? ""}
                  onChange={(e) => setPeriod(e.target.value || undefined)}
                  aria-label="Filtrar por período"
                >
                  <option value="">Todo o período</option>
                  {UNILIO_PERIODS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <button type="button" className="unilio-shell__reset" onClick={resetFilters}>
                  Limpar filtros
                </button>
              </div>
            </div>
          </header>
        ) : null}

        <Outlet context={{ persona, meta, isFallback }} />
      </div>
    </div>
  );
}
