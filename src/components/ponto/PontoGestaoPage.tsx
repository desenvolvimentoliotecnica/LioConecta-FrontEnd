import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import { usePontoManagementList } from "../../api/hooks/usePonto";
import { ApiError } from "../../api/client";
import { canAccessPontoManagement } from "../../api/auth";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import { PontoManagementDetailModal } from "./PontoManagementDetailModal";
import "../../styles/contracheque-page.css";
import "../../styles/ferias-ausencias-page.css";
import "../../styles/ponto-eletronico-page.css";

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function statusLabel(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "Pendente";
    case "approved":
      return "Aprovado";
    case "rejected":
      return "Rejeitado";
    case "completed":
      return "Concluído";
    default:
      return status;
  }
}

const STATUS_FILTERS = [
  { id: "", label: "Todos" },
  { id: "pending", label: "Pendente" },
  { id: "approved", label: "Aprovado" },
  { id: "rejected", label: "Rejeitado" },
  { id: "completed", label: "Concluído" },
] as const;

export function PontoGestaoPage() {
  const meQuery = useMe();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(requestId);

  const roleHint = canAccessPontoManagement(meQuery.data);
  const listQuery = usePontoManagementList({
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
        title="Gestão de ponto"
        current="Gestão de ponto"
        description="Acompanhe solicitações de ajuste de ponto da equipe. A correção formal continua no RM Labore."
        actions={
          <Link className="leave-btn leave-btn--ghost" to="/servicos/ponto-eletronico">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Meu espelho
          </Link>
        }
        toolbar={
          forbidden ? undefined : (
            <div className="pay-toolbar" aria-label="Filtros de gestão de ponto">
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
            A gestão de ponto é disponível para quem tem a permissão{" "}
            <code>ponto.manage</code> ou <code>ponto.approve</code> (regras RH, Gestor ou Key User
            RH no Controle de Acesso).
          </p>
          <p className="leave-gestao-denied__hint">
            Se você deveria ver ajustes da equipe, peça a regra <strong>Recursos Humanos</strong> ou{" "}
            <strong>Gestor</strong> em{" "}
            <Link to="/admin/controle-acesso">Controle de Acesso</Link>.
          </p>
          <div className="leave-gestao-denied__actions">
            <Link className="leave-btn leave-btn--primary" to="/servicos/ponto-eletronico">
              Ir para Meu espelho
            </Link>
          </div>
        </section>
      ) : (
        <section className="leave-gestao-list" aria-label="Solicitações de ajuste de ponto">
          {listQuery.isLoading ? <p>Carregando…</p> : null}
          {!listQuery.isLoading && items.length === 0 ? (
            <p className="leave-requests-panel__empty">Nenhuma solicitação encontrada.</p>
          ) : null}

          <ul className="leave-requests-list">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`leave-requests-list__item${selectedId === item.id ? " is-selected" : ""}`}
                  onClick={() => selectRequest(item.id)}
                >
                  <span
                    className="leave-requests-list__icon leave-requests-list__icon--vacation"
                    aria-hidden="true"
                  >
                    <i className="fa-solid fa-clock" />
                  </span>
                  <span className="leave-requests-list__body">
                    <span className="leave-requests-list__title">{item.employeeName}</span>
                    <span className="leave-requests-list__meta">
                      {item.title} · {item.dayCount} dia(s) · {formatDateTime(item.createdAt)}
                    </span>
                  </span>
                  <span className={`leave-badge leave-badge--${item.status.toLowerCase()}`}>
                    {statusLabel(item.status)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!forbidden ? (
        <PontoManagementDetailModal recordId={selectedId} onClose={closeDetail} />
      ) : null}
    </main>
  );
}
