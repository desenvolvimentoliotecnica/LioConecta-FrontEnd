import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMe } from "../../api/hooks/useMe";
import {
  serviceRequestStatusLabel,
  serviceRequestStatusTone,
  serviceRequestTypeLabel,
  useServiceRequestManagementList,
  useServiceRequestMineList,
} from "../../api/hooks/useServiceRequests";
import { ApiError } from "../../api/client";
import { canAccessRhRequestsManagement } from "../../api/auth";
import type { ServiceRequestDto } from "../../api/types";
import { RhPageHead } from "../servicos/RhPageHead";
import { sectionMainClass } from "../layout/SectionPageHead";
import { ServiceRequestDetailModal } from "../solicitacoes-rh/ServiceRequestDetailModal";
import "../../styles/contracheque-page.css";
import "../../styles/ferias-ausencias-page.css";

const STATUS_FILTERS = [
  { id: "", label: "Todos" },
  { id: "Submitted", label: "Pendente" },
  { id: "InReview", label: "Em análise" },
  { id: "AwaitingConfirmation", label: "Aguardando confirmação" },
  { id: "Approved", label: "Aprovado" },
  { id: "Rejected", label: "Rejeitado" },
  { id: "Completed", label: "Concluído" },
] as const;

type TabId = "management" | "mine";

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("pt-BR");
}

function statusClass(status: string | number): string {
  return `leave-badge leave-badge--${serviceRequestStatusTone(status)}`;
}

function payloadSummary(item: ServiceRequestDto): string {
  const p = item.payload ?? {};
  const benefitTitle = typeof p.benefitTitle === "string" ? p.benefitTitle : null;
  const notes = typeof p.notes === "string" ? p.notes : null;
  const competence = typeof p.competence === "string" ? p.competence : null;
  const serviceId = typeof p.serviceId === "string" ? p.serviceId : null;
  const parts = [benefitTitle, competence, serviceId, notes].filter(Boolean);
  if (parts.length === 0) return "—";
  const text = parts.join(" · ");
  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

export function SolicitacoesRhPage() {
  const meQuery = useMe();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestId = searchParams.get("requestId");
  const mineParam = searchParams.get("mine") === "1";
  const canManage = canAccessRhRequestsManagement(meQuery.data);
  const [tab, setTab] = useState<TabId>(mineParam || !canManage ? "mine" : "management");
  const [status, setStatus] = useState("Submitted");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(requestId);

  const listQuery = useServiceRequestManagementList({
    status: status || undefined,
    q: query || undefined,
    enabled: meQuery.isSuccess && canManage && tab === "management",
  });
  const mineQuery = useServiceRequestMineList(meQuery.isSuccess && tab === "mine");

  useEffect(() => {
    if (mineParam) setTab("mine");
    else if (canManage && !mineParam) setTab((prev) => (prev === "mine" && !requestId ? "management" : prev));
  }, [mineParam, canManage, requestId]);

  useEffect(() => {
    setSelectedId(requestId);
  }, [requestId]);

  const apiForbidden =
    listQuery.error instanceof ApiError && listQuery.error.status === 403;
  const managementForbidden = meQuery.isSuccess && tab === "management" && (!canManage || apiForbidden);
  const items = useMemo(() => {
    if (tab === "mine") return mineQuery.data ?? [];
    return listQuery.data ?? [];
  }, [tab, mineQuery.data, listQuery.data]);

  const activeQuery = tab === "mine" ? mineQuery : listQuery;

  const selectRequest = (id: string) => {
    setSelectedId(id);
    const next = new URLSearchParams();
    next.set("requestId", id);
    if (tab === "mine") next.set("mine", "1");
    setSearchParams(next, { replace: true });
  };

  const closeDetail = () => {
    setSelectedId(null);
    const next = new URLSearchParams();
    if (tab === "mine") next.set("mine", "1");
    setSearchParams(next, { replace: true });
  };

  const switchTab = (nextTab: TabId) => {
    setTab(nextTab);
    setSelectedId(null);
    const next = new URLSearchParams();
    if (nextTab === "mine") next.set("mine", "1");
    setSearchParams(next, { replace: true });
  };

  return (
    <main className={sectionMainClass("rh")}>
      <RhPageHead
        title="Solicitações RH"
        current="Solicitações RH"
        description="Conversa entre RH e colaborador com anexos, finalização do atendimento e confirmação de encerramento."
        toolbar={
          <div className="pay-toolbar" aria-label="Filtros de solicitações RH">
            <div className="pay-toolbar__filters page-filters" role="tablist" aria-label="Visão">
              {canManage ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "management"}
                  className={`filter-chip${tab === "management" ? " is-active" : ""}`}
                  onClick={() => switchTab("management")}
                >
                  Fila RH
                </button>
              ) : null}
              <button
                type="button"
                role="tab"
                aria-selected={tab === "mine"}
                className={`filter-chip${tab === "mine" ? " is-active" : ""}`}
                onClick={() => switchTab("mine")}
              >
                Meus pedidos
              </button>
            </div>
            {tab === "management" && canManage ? (
              <>
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
                      aria-label="Buscar pedidos"
                    />
                  </label>
                </div>
              </>
            ) : null}
          </div>
        }
      />

      {managementForbidden ? (
        <section className="leave-gestao-denied" role="alert">
          <h2>Acesso restrito</h2>
          <p>
            A fila RH é disponível para quem tem a permissão <code>rh_requests.manage</code>.
          </p>
          <p className="leave-gestao-denied__hint">
            Você ainda pode abrir a aba <strong>Meus pedidos</strong> ou pedir a regra em{" "}
            <Link to="/admin/controle-acesso">Controle de Acesso</Link>.
          </p>
        </section>
      ) : (
        <section
          className="leave-gestao-list"
          aria-label={tab === "mine" ? "Meus pedidos de RH" : "Fila de solicitações RH"}
        >
          {activeQuery.isLoading ? <p>Carregando pedidos…</p> : null}
          {activeQuery.isError ? (
            <p role="alert">
              Não foi possível carregar os pedidos.
              {activeQuery.error instanceof ApiError
                ? ` (erro ${activeQuery.error.status})`
                : null}
            </p>
          ) : null}
          {!activeQuery.isLoading && !activeQuery.isError && items.length === 0 ? (
            <p className="leave-requests-panel__empty">
              {tab === "mine"
                ? "Você ainda não tem pedidos de benefícios ou contracheque."
                : "Nenhum pedido encontrado para este filtro."}
            </p>
          ) : null}
          {!activeQuery.isError ? (
            <ul className="leave-requests-list">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`leave-requests-list__item${selectedId === item.id ? " is-selected" : ""}`}
                    data-testid={`sr-card-${item.id}`}
                    onClick={() => selectRequest(item.id)}
                  >
                    <span
                      className="leave-requests-list__icon leave-requests-list__icon--other"
                      aria-hidden="true"
                    >
                      <i
                        className={`fa-solid ${
                          item.type === "servicos-beneficios"
                            ? "fa-hand-holding-heart"
                            : "fa-file-invoice-dollar"
                        }`}
                      />
                    </span>
                    <span className="leave-requests-list__body">
                      <span className="leave-requests-list__head">
                        <span className="leave-requests-list__title">
                          {tab === "mine"
                            ? serviceRequestTypeLabel(item.type)
                            : item.requester.name}
                        </span>
                        <span className={statusClass(item.status)}>
                          {serviceRequestStatusLabel(item.status)}
                        </span>
                      </span>
                      <span className="leave-requests-list__meta">
                        {tab === "mine" ? (
                          <span>{payloadSummary(item)}</span>
                        ) : (
                          <>
                            <span>{serviceRequestTypeLabel(item.type)}</span>
                            {item.requester.departmentName ? (
                              <span>{item.requester.departmentName}</span>
                            ) : null}
                            <span>{payloadSummary(item)}</span>
                          </>
                        )}
                        <span>{formatDateTime(item.updatedAt)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      <ServiceRequestDetailModal
        requestId={selectedId}
        mode={tab === "mine" ? "mine" : "management"}
        onClose={closeDetail}
      />
    </main>
  );
}
