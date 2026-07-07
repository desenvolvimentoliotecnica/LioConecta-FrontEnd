import { useEffect, useMemo, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import { PERSONA_LABELS } from "../../config/pulse/constants";
import { useModuleFocus } from "../../context/ModuleFocusContext";
import { getPulseData, resolvePulsePersona } from "../../utils/pulseView";
import { ModuleFocusButton } from "../shared/ModuleFocusButton";
import { usePulseFilters } from "./PulseAccessGate";
import { PulseNav } from "./PulseNav";
import "../../styles/pulse-shell.css";

export function PulseShell() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const { focusMode } = useModuleFocus();
  const { filters, setTeamId, setSprintId, setSearch, resetFilters } = usePulseFilters();
  const { data: me } = useMe();
  const data = getPulseData();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);

  useEffect(() => {
    if (focusMode) setNavCollapsed(true);
  }, [focusMode]);

  const openImpediments = useMemo(
    () => data.impediments.filter((i) => i.status !== "resolvido").length,
    [data.impediments],
  );

  const visibleTeams = useMemo(() => {
    if (persona.persona === "observer") return data.teams;
    return data.teams.filter((t) => persona.visibleTeamIds.includes(t.id));
  }, [data.teams, persona]);

  const visibleSprints = useMemo(() => {
    return data.sprints.filter((s) => {
      if (filters.teamId && s.teamId !== filters.teamId) return false;
      if (persona.persona !== "observer" && !persona.visibleTeamIds.includes(s.teamId)) return false;
      return true;
    });
  }, [data.sprints, filters.teamId, persona]);

  const navIsCollapsed = navCollapsed || focusMode;

  return (
    <div className={`pulse-shell${navIsCollapsed ? " pulse-shell--nav-collapsed" : ""}${focusMode ? " pulse-shell--module-focus" : ""}`}>
      <PulseNav
        collapsed={navIsCollapsed}
        onToggle={() => setNavCollapsed((c) => !c)}
        openImpediments={openImpediments}
      />

      <div className="pulse-shell__main">
        <header className="pulse-shell__header">
          <div className="pulse-shell__header-top">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Início</Link>
              <span className="breadcrumb__sep">/</span>
              <span className="breadcrumb__current">Pulse Ágil</span>
            </nav>
            <div className="pulse-shell__header-actions">
              <ModuleFocusButton />
              <span className="pulse-shell__persona" title={PERSONA_LABELS[persona.persona]}>
                <i className="fa-solid fa-user-tag" aria-hidden="true" />
                {persona.label}
              </span>
            </div>
          </div>

          <div className="pulse-shell__toolbar">
            <div className="pulse-shell__search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                type="search"
                placeholder="Buscar história, impedimento, reunião…"
                value={filters.search ?? ""}
                onChange={(e) => setSearch(e.target.value || undefined)}
                aria-label="Busca no Pulse"
              />
            </div>

            <div className="pulse-shell__filters">
              <select
                className="pulse-shell__select"
                value={filters.teamId ?? ""}
                onChange={(e) => setTeamId(e.target.value || undefined)}
                aria-label="Filtrar por squad"
              >
                <option value="">Todos os squads</option>
                {visibleTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                className="pulse-shell__select"
                value={filters.sprintId ?? ""}
                onChange={(e) => setSprintId(e.target.value || undefined)}
                aria-label="Filtrar por sprint"
              >
                <option value="">Todos os sprints</option>
                {visibleSprints.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <button type="button" className="pulse-shell__reset" onClick={resetFilters}>
                Limpar filtros
              </button>
            </div>
          </div>
        </header>

        <Outlet context={{ persona }} />
      </div>
    </div>
  );
}
