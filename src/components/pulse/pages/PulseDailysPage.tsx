import { useMemo } from "react";
import { useMe } from "../../../api/hooks/useMe";
import { buildDailysView, resolvePulsePersona } from "../../../utils/pulseView";
import { usePulseFilters } from "../PulseAccessGate";
import { PulseDailyModes } from "../PulseDailyModes";
import "../../../styles/pulse-dailys.css";

export function PulseDailysPage() {
  const { filters } = usePulseFilters();
  const { data: me } = useMe();
  const persona = useMemo(() => resolvePulsePersona(me), [me]);
  const entries = useMemo(() => buildDailysView(filters, persona), [filters, persona]);

  return (
    <main className="pulse-page">
      <div className="pulse-page__head">
        <h1 className="pulse-page__title">Dailys</h1>
        <p className="pulse-page__desc">
          Atualizações diárias do squad — ontem, hoje e impedimentos.
        </p>
      </div>

      <PulseDailyModes entries={entries} />

      <footer className="pulse-page__footer">Dados simulados — Pulse Ágil (mock)</footer>
    </main>
  );
}
