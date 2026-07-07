import { useEffect, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { LOOP_PERIODS } from "../../config/loop/constants";
import { useModuleFocus } from "../../context/ModuleFocusContext";
import { getLoopData } from "../../utils/loopView";
import { ModuleFocusButton } from "../shared/ModuleFocusButton";
import { useLoopFilters } from "./LoopAccessGate";
import { LoopNav } from "./LoopNav";
import "../../styles/loop-shell.css";

export function LoopShell() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const { focusMode } = useModuleFocus();
  const { filters, setPeriod, setTeamId, setProjectId, setSearch, resetFilters } = useLoopFilters();
  const data = getLoopData();

  useEffect(() => {
    if (focusMode) setNavCollapsed(true);
  }, [focusMode]);

  const pendingApprovals = useMemo(
    () => data.approvals.filter((a) => a.status === "pendente").length,
    [data.approvals],
  );

  const navIsCollapsed = navCollapsed || focusMode;

  return (
    <div className={`loop-shell${navIsCollapsed ? " loop-shell--nav-collapsed" : ""}${focusMode ? " loop-shell--module-focus" : ""}`}>
      <LoopNav
        collapsed={navIsCollapsed}
        onToggle={() => setNavCollapsed((c) => !c)}
        pendingApprovals={pendingApprovals}
      />

      <div className="loop-shell__main">
        <header className="loop-shell__header">
          <div className="loop-shell__header-top">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Início</Link>
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">Loop de Projetos</span>
            </nav>
            <ModuleFocusButton />
          </div>

          <div className="loop-shell__toolbar">
            <div className="loop-shell__search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar projeto, atividade, equipe…"
                value={filters.search ?? ""}
                onChange={(e) => setSearch(e.target.value || undefined)}
                aria-label="Busca no Loop"
              />
            </div>

            <div className="loop-shell__filters">
              <div className="loop-shell__filter-chips" role="group" aria-label="Período">
                {LOOP_PERIODS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`filter-chip${filters.period === p.id ? " is-active" : ""}`}
                    onClick={() => setPeriod(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <select
                className="loop-shell__select"
                value={filters.teamId ?? ""}
                onChange={(e) => setTeamId(e.target.value || undefined)}
                aria-label="Filtrar por equipe"
              >
                <option value="">Todas as equipes</option>
                {data.teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                className="loop-shell__select"
                value={filters.projectId ?? ""}
                onChange={(e) => setProjectId(e.target.value || undefined)}
                aria-label="Filtrar por projeto"
              >
                <option value="">Todos os projetos</option>
                {data.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button type="button" className="loop-shell__reset" onClick={resetFilters}>
                Limpar filtros
              </button>
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}
