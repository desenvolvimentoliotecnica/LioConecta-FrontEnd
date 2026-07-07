import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { buildBoardView, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseBoard } from "../PulseBoard";
import "../../../styles/pulse-board.css";

export function PulseBoardPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const view = useMemo(() => buildBoardView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Board</h1>
        <p className="pulse-page__desc">
          Quadro Kanban do sprint — arraste histórias entre colunas (estado local).
        </p>
      </div>

      <PulseBoard view={view} />

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
