import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useCompassMeta } from "../../api/hooks/useCompassMeta";
import { useCompassDashboard } from "../../api/hooks/useCompassDashboard";
import { useMe } from "../../api/hooks/useMe";
import { PERSONA_LABELS } from "../../config/compass/constants";
import { useModuleFocus } from "../../context/ModuleFocusContext";
import { resolveCompassPersona } from "../../utils/compassView";
import { ModuleFocusButton } from "../shared/ModuleFocusButton";
import { useCompassFilters } from "./CompassAccessGate";
import { CompassFallbackBanner, CompassHyperionBadge } from "./CompassHyperionShared";
import { CompassInfoButton } from "./help/CompassInfoButton";
import { CompassNav } from "./CompassNav";
import "../../styles/compass-shell.css";
import "../../styles/compass-help.css";

export function CompassShell() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const { focusMode } = useModuleFocus();
  const location = useLocation();
  const hideGlobalFilters = /\/compass\/cenarios\/?$/.test(location.pathname);
  const { filters, setDiretoria, setUnidade, setFamilia, setTipo, setSearch, resetFilters } = useCompassFilters();
  const { data: me } = useMe();
  const { data: meta, isFallback: metaFallback } = useCompassMeta();
  const { data: dashboard, isFallback: dashboardFallback } = useCompassDashboard(filters);
  const persona = useMemo(() => resolveCompassPersona(me, meta), [me, meta]);

  useEffect(() => {
    if (focusMode) setNavCollapsed(true);
  }, [focusMode]);

  const criticalGaps = dashboard.topGaps.filter((g) => g.severity === "critico").length;
  const upcomingMeetings = dashboard.upcomingMeetings.length;
  const isFallback = metaFallback || dashboardFallback;

  const visibleDirectorias = useMemo(() => {
    if (persona.persona === "executive") return meta.directorias;
    return meta.directorias.filter((d) => persona.visibleDiretorias.includes(d.label));
  }, [meta.directorias, persona]);

  const navIsCollapsed = navCollapsed || focusMode;

  return (
    <div
      className={`compass-shell${navIsCollapsed ? " compass-shell--nav-collapsed" : ""}${focusMode ? " compass-shell--module-focus" : ""}`}
    >
      <CompassNav
        collapsed={navIsCollapsed}
        onToggle={() => setNavCollapsed((c) => !c)}
        criticalGaps={criticalGaps}
        upcomingMeetings={upcomingMeetings}
      />

      <div className="compass-shell__main">
        <header className="compass-shell__header">
          <div className="compass-shell__header-top">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Início</Link>
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">Compass IBP</span>
            </nav>
            <div className="compass-shell__header-actions">
              <CompassHyperionBadge
                label={meta.hyperionBadge ?? "Hyperion EPBCS"}
                snapshotName={meta.snapshot.name}
                periodLabel={meta.snapshot.periodLabel}
              />
              <ModuleFocusButton />
              <span className="compass-shell__persona" title={PERSONA_LABELS[persona.persona]}>
                <i className="fa-solid fa-user-tag" aria-hidden="true" />
                {persona.label}
                <CompassInfoButton infoId="shell-persona" className="compass-shell__persona-info" />
              </span>
            </div>
          </div>

          <CompassFallbackBanner show={isFallback} />

          {!hideGlobalFilters ? (
            <div className="compass-shell__toolbar">
              <div className="compass-shell__search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Buscar diretoria, unidade, família, conta…"
                  value={filters.search ?? ""}
                  onChange={(e) => setSearch(e.target.value || undefined)}
                  aria-label="Busca no Compass"
                />
                <CompassInfoButton infoId="filter-search" />
              </div>

              <div className="compass-shell__filters">
                <select
                  className="compass-shell__select"
                  value={filters.diretoria ?? ""}
                  onChange={(e) => setDiretoria(e.target.value || undefined)}
                  aria-label="Filtrar por diretoria"
                >
                  <option value="">Todas as diretorias</option>
                  {visibleDirectorias.map((d) => (
                    <option key={d.value} value={d.label}>
                      {d.label}
                    </option>
                  ))}
                </select>

                <select
                  className="compass-shell__select"
                  value={filters.unidade ?? ""}
                  onChange={(e) => setUnidade(e.target.value || undefined)}
                  aria-label="Filtrar por unidade"
                >
                  <option value="">Todas as unidades</option>
                  {meta.unidades.map((u) => (
                    <option key={u.value} value={u.label}>
                      {u.label}
                    </option>
                  ))}
                </select>

                <select
                  className="compass-shell__select"
                  value={filters.familia ?? ""}
                  onChange={(e) => setFamilia(e.target.value || undefined)}
                  aria-label="Filtrar por família"
                >
                  <option value="">Todas as famílias</option>
                  {meta.familias.map((f) => (
                    <option key={f.value} value={f.label}>
                      {f.label}
                    </option>
                  ))}
                </select>

                <select
                  className="compass-shell__select"
                  value={filters.tipo ?? ""}
                  onChange={(e) => setTipo(e.target.value || undefined)}
                  aria-label="Filtrar por tipo"
                >
                  <option value="">Todos os tipos</option>
                  {meta.tipos.map((t) => (
                    <option key={t.value} value={t.label}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <button type="button" className="compass-shell__reset" onClick={resetFilters}>
                  Limpar filtros
                </button>
              </div>
            </div>
          ) : null}
        </header>

        <Outlet context={{ persona, meta, isFallback }} />
      </div>
    </div>
  );
}
