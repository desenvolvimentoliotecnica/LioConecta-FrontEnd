import { useUniLioManagerTeam } from "../../../api/hooks/useUniLioManagerTeam";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioKpiGrid } from "../UniLioKpiGrid";
import { UniLioProgressBar } from "../UniLioShared";

export function UniLioGestorPage() {
  const { data, isLoading, isFallback } = useUniLioManagerTeam();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando time…</p>
      </main>
    );
  }

  const kpis = [
    {
      id: "members",
      label: "Colaboradores",
      value: String(data.totalMembers),
      delta: "",
      trend: "neutral" as const,
      icon: "fa-users",
    },
    {
      id: "completion",
      label: "Conclusão média",
      value: `${data.avgCompletionPct}%`,
      delta: "",
      trend: "up" as const,
      icon: "fa-chart-line",
    },
  ];

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Meu Time</h1>
        <p className="unilio-page__desc">Acompanhamento de aprendizagem dos colaboradores diretos.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />
      <UniLioKpiGrid kpis={kpis} />

      <div className="unilio-table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Departamento</th>
              <th>Matriculados</th>
              <th>Concluídos</th>
              <th>Obrigatórios pendentes</th>
              <th>Progresso médio</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((member) => (
              <tr key={member.personId}>
                <td>{member.name}</td>
                <td>{member.department}</td>
                <td>{member.enrolledCount}</td>
                <td>{member.completedCount}</td>
                <td>{member.mandatoryPending}</td>
                <td><UniLioProgressBar value={member.avgProgressPct} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
