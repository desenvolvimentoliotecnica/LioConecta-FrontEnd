import { useMemo, useState } from "react";
import {
  useImportOrgChartFromGraph,
  useOrgChartDepartments,
  useOrgChartGovernanceSummary,
  useOrgChartPositions,
} from "../../api/hooks/useOrgChartGovernance";
import type { OrgPositionSource } from "../../api/types";

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function sourceLabel(source: OrgPositionSource | number | string): string {
  if (source === "manual" || source === 1 || source === "Manual") return "Manual";
  return "Graph";
}

export function OrganogramManagementSection() {
  const summaryQuery = useOrgChartGovernanceSummary();
  const positionsQuery = useOrgChartPositions();
  const departmentsQuery = useOrgChartDepartments();
  const importMutation = useImportOrgChartFromGraph();
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const filteredPositions = useMemo(() => {
    const items = positionsQuery.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((position) => {
      const haystack = [
        position.personName,
        position.title,
        position.departmentName,
        position.managerName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [positionsQuery.data, search]);

  const handleImport = async (force: boolean) => {
    setFeedback(null);
    try {
      const result = await importMutation.mutateAsync({ force });
      setFeedback({
        type: "success",
        message: `Importação concluída — ${result.totalPositions} posições, ${result.activeDepartments} departamentos ativos.`,
      });
      await Promise.all([summaryQuery.refetch(), positionsQuery.refetch(), departmentsQuery.refetch()]);
    } catch {
      setFeedback({ type: "error", message: "Não foi possível importar dados do Graph." });
    }
  };

  const summary = summaryQuery.data;

  return (
    <section className="org-governance__panel" aria-label="Gestão do organograma">
      <div className="org-governance__toolbar">
        <button
          type="button"
          className="org-governance__btn org-governance__btn--primary"
          onClick={() => void handleImport(false)}
          disabled={importMutation.isPending}
        >
          {importMutation.isPending ? "Importando…" : "Importar do Graph"}
        </button>
        <button
          type="button"
          className="org-governance__btn"
          onClick={() => void handleImport(true)}
          disabled={importMutation.isPending}
        >
          Forçar reimportação
        </button>
        <a className="org-governance__btn" href="/pessoas/organograma?view=full">
          Abrir organograma
        </a>
      </div>

      {feedback ? (
        <div className={`org-governance__alert org-governance__alert--${feedback.type}`} role="status">
          {feedback.message}
        </div>
      ) : null}

      <div className="org-governance__summary-grid">
        <article className="org-governance__summary-card">
          <span className="org-governance__summary-label">Posições</span>
          <strong className="org-governance__summary-value">{summary?.totalPositions ?? "—"}</strong>
        </article>
        <article className="org-governance__summary-card">
          <span className="org-governance__summary-label">Visíveis</span>
          <strong className="org-governance__summary-value">{summary?.visiblePositions ?? "—"}</strong>
        </article>
        <article className="org-governance__summary-card">
          <span className="org-governance__summary-label">Overrides manuais</span>
          <strong className="org-governance__summary-value">{summary?.manualOverrides ?? "—"}</strong>
        </article>
        <article className="org-governance__summary-card">
          <span className="org-governance__summary-label">Departamentos ativos</span>
          <strong className="org-governance__summary-value">{summary?.activeDepartments ?? "—"}</strong>
        </article>
        <article className="org-governance__summary-card">
          <span className="org-governance__summary-label">Última importação</span>
          <strong className="org-governance__summary-value" style={{ fontSize: 14 }}>
            {formatDateTime(summary?.lastImportAt)}
          </strong>
        </article>
      </div>

      <div className="org-governance__split">
        <div>
          <label className="org-governance__field">
            <span>Buscar posições</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, cargo, departamento ou gestor"
            />
          </label>

          {positionsQuery.isError ? (
            <p className="org-governance__empty">Não foi possível carregar as posições.</p>
          ) : positionsQuery.isLoading ? (
            <p className="org-governance__empty">Carregando posições…</p>
          ) : (
            <div className="org-governance__table-wrap">
              <table className="org-governance__table">
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Cargo</th>
                    <th>Departamento</th>
                    <th>Gestor</th>
                    <th>Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPositions.map((position) => (
                    <tr key={position.id}>
                      <td>
                        {position.personName}
                        {!position.isVisible ? (
                          <span className="org-governance__badge org-governance__badge--hidden">
                            {" "}
                            Oculto
                          </span>
                        ) : null}
                      </td>
                      <td>{position.title || "—"}</td>
                      <td>{position.departmentName || "—"}</td>
                      <td>{position.managerName || "—"}</td>
                      <td>
                        <span
                          className={`org-governance__badge ${
                            sourceLabel(position.source) === "Manual"
                              ? "org-governance__badge--manual"
                              : "org-governance__badge--graph"
                          }`}
                        >
                          {sourceLabel(position.source)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <aside>
          <h2 className="org-governance__intro-title">Departamentos</h2>
          {departmentsQuery.isError ? (
            <p className="org-governance__empty">Não foi possível carregar departamentos.</p>
          ) : departmentsQuery.isLoading ? (
            <p className="org-governance__empty">Carregando departamentos…</p>
          ) : !departmentsQuery.data?.length ? (
            <p className="org-governance__empty">Nenhum departamento cadastrado.</p>
          ) : (
            <div className="org-governance__table-wrap">
              <table className="org-governance__table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentsQuery.data.map((department) => (
                    <tr key={department.id}>
                      <td>{department.name}</td>
                      <td>{department.isActive ? "Ativo" : "Inativo"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
