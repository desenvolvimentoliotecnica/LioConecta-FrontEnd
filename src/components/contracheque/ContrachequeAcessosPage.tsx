import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import { usePayslipAccessLog } from "../../api/hooks/usePayslips";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../config/rbac/permissions";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/contracheque-page.css";
import "../../styles/ferias-ausencias-page.css";

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function actionLabel(action: string): string {
  switch (action.toLowerCase()) {
    case "download":
      return "Download PDF";
    case "view":
      return "Visualização";
    default:
      return action;
  }
}

export function ContrachequeAcessosPage() {
  const meQuery = useMe();
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(PERMISSIONS.payslips.audit);
  const [page, setPage] = useState(1);
  const [targetFilter, setTargetFilter] = useState("");

  const logQuery = usePayslipAccessLog({
    page,
    pageSize: 25,
    targetPersonId: targetFilter.trim() || undefined,
    enabled: meQuery.isSuccess && allowed,
  });

  const items = useMemo(() => logQuery.data?.items ?? [], [logQuery.data]);
  const totalPages = logQuery.data?.totalPages ?? 0;

  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Acessos ao contracheque"
        current="Acessos"
        description="Auditoria de visualizações e downloads de holerite (ator, alvo, competência e ação)."
        actions={
          <Link className="leave-btn leave-btn--ghost" to="/servicos/contracheque">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Contracheque
          </Link>
        }
      />

      {!allowed ? (
        <section className="leave-gestao-denied" role="alert">
          <h2>Acesso restrito</h2>
          <p>
            Esta tela exige a permissão <code>{PERMISSIONS.payslips.audit}</code> (perfil RH / Key
            User RH).
          </p>
          <Link className="leave-btn leave-btn--primary" to="/admin/controle-acesso">
            Controle de Acesso
          </Link>
        </section>
      ) : (
        <section className="leave-gestao-list" aria-label="Log de acessos a holerites">
          <div className="pay-toolbar" style={{ marginBottom: "1rem" }}>
            <label className="pay-search page-search">
              <i className="fa-solid fa-filter" aria-hidden="true" />
              <input
                className="page-search__input"
                type="search"
                value={targetFilter}
                onChange={(e) => {
                  setTargetFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Filtrar por personId do alvo (GUID)"
                aria-label="Filtrar por colaborador alvo"
              />
            </label>
          </div>

          {logQuery.isLoading ? <p>Carregando…</p> : null}
          {!logQuery.isLoading && items.length === 0 ? (
            <p className="leave-requests-panel__empty">
              Nenhum acesso a holerite registrado no período.
            </p>
          ) : null}

          {items.length > 0 ? (
            <table className="pay-table">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Ator</th>
                  <th>Alvo</th>
                  <th>Competência</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.occurredAt)}</td>
                    <td>
                      {item.actorName || item.actorEmail || "—"}
                      {item.actorEmail && item.actorName ? (
                        <div className="leave-requests-list__meta">{item.actorEmail}</div>
                      ) : null}
                    </td>
                    <td>
                      {item.targetName || "—"}
                      {item.targetEmployeeId ? (
                        <div className="leave-requests-list__meta">Chapa {item.targetEmployeeId}</div>
                      ) : null}
                    </td>
                    <td>{item.competence || "—"}</td>
                    <td>{actionLabel(item.action)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {totalPages > 1 ? (
            <div className="pay-toolbar" style={{ marginTop: "1rem", gap: "0.5rem" }}>
              <button
                type="button"
                className="leave-btn leave-btn--ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                className="leave-btn leave-btn--ghost"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </button>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
