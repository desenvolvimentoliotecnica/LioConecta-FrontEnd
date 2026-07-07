import { useMemo } from "react";
import { buildLoopRoadmap } from "../../../utils/loopView";
import { useLoopFilters } from "../LoopAccessGate";
import { LoopRoadmap } from "../LoopRoadmap";
import "../../../styles/loop-roadmap.css";
import "../../../styles/loop-dashboard.css";

export function LoopPlanningPage() {
  const { filters } = useLoopFilters();
  const rows = useMemo(() => buildLoopRoadmap(filters), [filters]);

  return (
    <main className="loop-page">
      <div className="loop-page__head">
        <h1 className="loop-page__title">Planejamento</h1>
        <p className="loop-page__desc">Roadmap de projetos com fases, marcos e linha do dia atual.</p>
      </div>

      <LoopRoadmap rows={rows} />

      <footer className="loop-page__footer">Dados simulados — Loop de Projetos (mock)</footer>
    </main>
  );
}
