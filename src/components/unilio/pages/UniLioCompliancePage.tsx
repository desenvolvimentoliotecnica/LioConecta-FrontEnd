import { Link } from "react-router-dom";
import { useUniLioCompliance } from "../../../api/hooks/useUniLioCompliance";
import { formatUniLioDate } from "../../../utils/unilioView";
import { COMPLIANCE_STATUS_LABELS } from "../../../config/unilio/constants";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import { UniLioKpiGrid } from "../UniLioKpiGrid";
import { UniLioProgressBar } from "../UniLioShared";

export function UniLioCompliancePage() {
  const { data, isLoading, isFallback } = useUniLioCompliance();

  if (isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando compliance…</p>
      </main>
    );
  }

  const kpis = [
    { id: "completed", label: "Concluídos", value: String(data.completedCount), delta: "", trend: "neutral" as const, icon: "fa-circle-check" },
    { id: "pending", label: "Pendentes", value: String(data.pendingCount), delta: "", trend: "neutral" as const, icon: "fa-clock" },
    { id: "overdue", label: "Vencidos", value: String(data.overdueCount), delta: "", trend: "down" as const, icon: "fa-triangle-exclamation", mod: "amber" },
  ];

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <h1 className="unilio-page__title">Compliance</h1>
        <p className="unilio-page__desc">Treinamentos obrigatórios e prazos de conclusão.</p>
      </div>

      <UniLioFallbackBanner show={isFallback} />
      <UniLioKpiGrid kpis={kpis} />

      <div className="unilio-table-wrap">
        <table className="audit-trail-page__table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Área</th>
              <th>Progresso</th>
              <th>Status</th>
              <th>Prazo</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.courseId} className={item.isOverdue ? "unilio-row--overdue" : ""}>
                <td>
                  <Link to={`/unilio/curso/${item.courseId}`}>{item.title}</Link>
                </td>
                <td>{item.area}</td>
                <td><UniLioProgressBar value={item.progressPct} /></td>
                <td>{COMPLIANCE_STATUS_LABELS[item.status] ?? item.status}</td>
                <td>{item.dueDate ? formatUniLioDate(item.dueDate) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
