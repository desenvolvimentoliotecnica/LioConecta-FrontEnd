import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import { useLeaveManagementList } from "../../api/hooks/useLeave";
import { ApiError } from "../../api/client";
import { canAccessLeaveManagement } from "../../api/auth";
import { leaveRequestIconClass, leaveRequestKindFromTitle } from "../../utils/leaveHelpers";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import { LeaveStatusBadge } from "./LeaveStatusBadge";
import { LeaveManagementDetailModal } from "./LeaveManagementDetailModal";
import "../../styles/contracheque-page.css";
import "../../styles/ferias-ausencias-page.css";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
}

const STATUS_FILTERS = [
  { id: "", label: "Todos" },
  { id: "pending", label: "Pendente" },
  { id: "approved", label: "Aprovado" },
  { id: "rejected", label: "Rejeitado" },
  { id: "completed", label: "Concluído" },
] as const;

export function FeriasGestaoPage() {
  const meQuery = useMe();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(requestId);

  const roleHint = canAccessLeaveManagement(meQuery.data);
  const listQuery = useLeaveManagementList({
    status: status || undefined,
    q: query || undefined,
    enabled: meQuery.isSuccess && roleHint,
  });

  useEffect(() => {
    setSelectedId(requestId);
  }, [requestId]);

  const apiForbidden =
    listQuery.error instanceof ApiError && listQuery.error.status === 403;
  const forbidden = meQuery.isSuccess && (!roleHint || apiForbidden);

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data]);

  const selectRequest = (id: string) => {
    setSelectedId(id);
    setSearchParams({ requestId: id }, { replace: true });
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSearchParams({}, { replace: true });
  };

  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Gestão de férias"
        current="Gestão de férias"
        description="Aprove ou rejeite solicitações da equipe. O write-back ao Totvs RM segue o modo configurado (dry-run / apply com rollback)."
        actions={
          <Link className="leave-btn leave-btn--ghost" to="/servicos/ferias-ausencias">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Minhas férias
          </Link>
        }
        toolbar={
          forbidden ? undefined : (
            <div className="pay-toolbar" aria-label="Filtros de gestão de férias">
              <div className="pay-toolbar__filters page-filters" role="group" aria-label="Status">
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.id || "all"}
                    type="button"
                    className={`filter-chip${status === filter.id ? " is-active" : ""}`}
                    onClick={() => setStatus(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="pay-toolbar__actions">
                <label className="pay-search page-search">
                  <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                  <input
                    className="page-search__input"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nome, e-mail ou chapa"
                    aria-label="Buscar solicitações"
                  />
                </label>
              </div>
            </div>
          )
        }
      />

      {forbidden ? (
        <section className="leave-gestao-denied" role="alert">
          <h2>Acesso restrito</h2>
          <p>
            A gestão de férias é disponível para quem tem a permissão{" "}
            <code>leave.manage</code> ou <code>leave.approve</code> (regras RH, Gestor ou Key User RH
            no Controle de Acesso). O perfil Administrador sozinho não inclui essa permissão.
          </p>
          <p className="leave-gestao-denied__hint">
            Se você deveria gerenciar férias da equipe, peça a regra <strong>Recursos Humanos</strong>{" "}
            ou <strong>Gestor</strong> em{" "}
            <Link to="/admin/controle-acesso">Controle de Acesso</Link>.
          </p>
          <div className="leave-gestao-denied__actions">
            <Link className="leave-btn leave-btn--primary" to="/servicos/ferias-ausencias">
              Ir para Minhas férias
            </Link>
          </div>
        </section>
      ) : (
        <section className="leave-gestao-list" aria-label="Solicitações de férias">
          {listQuery.isLoading ? <p>Carregando…</p> : null}
          {!listQuery.isLoading && items.length === 0 ? (
            <p className="leave-requests-panel__empty">Nenhuma solicitação encontrada.</p>
          ) : null}

          <ul className="leave-requests-list">
            {items.map((item) => {
              const kind = leaveRequestKindFromTitle(item.title);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`leave-requests-list__item${selectedId === item.id ? " is-selected" : ""}`}
                    onClick={() => selectRequest(item.id)}
                  >
                    <span
                      className={`leave-requests-list__icon leave-requests-list__icon--${kind}`}
                      aria-hidden="true"
                    >
                      <i className={`fa-solid ${leaveRequestIconClass(item.title)}`} />
                    </span>
                    <span className="leave-requests-list__body">
                      <span className="leave-requests-list__head">
                        <span className="leave-requests-list__title">{item.employeeName}</span>
                        <LeaveStatusBadge status={item.status} rmSyncStatus={item.rmSyncStatus} />
                      </span>
                      <span className="leave-requests-list__meta">
                        <span>{item.title}</span>
                        <span>{item.employeeId ?? item.email}</span>
                        <span>
                          {formatDate(item.startDate)}
                          {item.endDate ? ` — ${formatDate(item.endDate)}` : ""}
                        </span>
                        {item.days != null ? <span>{item.days} dia(s)</span> : null}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {!forbidden ? (
        <LeaveManagementDetailModal recordId={selectedId} onClose={closeDetail} />
      ) : null}
    </main>
  );
}
