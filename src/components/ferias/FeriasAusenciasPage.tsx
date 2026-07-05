import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useLeaveRequest,
  useLeaveServices,
  useLeaveSummary,
} from "../../api/hooks/useLeave";
import { useToggleBookmark } from "../../api/hooks/usePreferences";
import type { LeaveServiceDto } from "../../api/types";
import { bookmarkIdForLeave, formatSensitiveCount } from "../../utils/money";
import { LeaveBalanceModal } from "./LeaveBalanceModal";
import { LeaveBancoHorasModal } from "./LeaveBancoHorasModal";
import { LeaveHelpModal } from "./LeaveHelpModal";
import { LeaveHistoryModal } from "./LeaveHistoryModal";
import { LeaveRequestModal } from "./LeaveRequestModal";
import { LeaveRequestResultModal } from "./LeaveRequestResultModal";
import { filterLeaveServices, LeaveServiceCard } from "./LeaveServiceCard";
import { LeaveTeamCalendarModal } from "./LeaveTeamCalendarModal";
import "../../styles/contracheque-page.css";
import "../../styles/ferias-ausencias-page.css";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "ferias", label: "Férias" },
  { id: "licenca", label: "Licenças" },
  { id: "afastamento", label: "Afastamentos" },
  { id: "consulta", label: "Consultas" },
  { id: "banco", label: "Banco de horas" },
] as const;

export function FeriasAusenciasPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showValues, setShowValues] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bancoOpen, setBancoOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [requestService, setRequestService] = useState<LeaveServiceDto | null>(null);
  const [helpService, setHelpService] = useState<LeaveServiceDto | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  const summaryQuery = useLeaveSummary();
  const servicesQuery = useLeaveServices();
  const requestMutation = useLeaveRequest();
  const { toggle: toggleBookmark, isSaved } = useToggleBookmark();

  const filtered = useMemo(
    () => filterLeaveServices(servicesQuery.data ?? [], category, query),
    [servicesQuery.data, category, query],
  );

  const openPortal = (service: LeaveServiceDto) => {
    if (!service.portalUrl) return;
    if (service.portalUrl.startsWith("/")) {
      window.location.href = service.portalUrl;
      return;
    }
    window.open(service.portalUrl, "_blank", "noopener,noreferrer");
  };

  const handlePrimaryAction = (service: LeaveServiceDto) => {
    switch (service.id) {
      case "saldo-ferias":
        setBalanceOpen(true);
        break;
      case "historico":
        setHistoryOpen(true);
        break;
      case "banco-horas":
        setBancoOpen(true);
        break;
      case "calendario-equipe":
        if (service.portalUrl?.startsWith("http")) {
          openPortal(service);
        } else {
          setTeamOpen(true);
        }
        break;
      case "afast-inss":
        if (service.portalUrl) {
          openPortal(service);
        } else {
          setHelpService(service);
        }
        break;
      default:
        if (["Solicitar", "Registrar"].includes(service.action)) {
          setRequestService(service);
        } else if (service.action === "Consultar") {
          setHelpService(service);
        } else if (service.action === "Abrir") {
          if (service.portalUrl) {
            openPortal(service);
          } else {
            setTeamOpen(true);
          }
        }
        break;
    }
  };

  const handleRequestSubmit = (payload: {
    serviceId: string;
    startDate?: string;
    endDate?: string;
    days?: number;
    notes?: string;
  }) => {
    requestMutation.mutate(payload, {
      onSuccess: (result) => {
        setRequestService(null);
        setRequestMessage(result.message);
      },
    });
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span>Serviços</span>
          <span className="breadcrumb__sep">/</span>
          <span>RH &amp; Pessoas</span>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Férias e ausências</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Férias e Ausências</h1>
            <p className="page-header__desc">
              Solicite férias, registre ausências, consulte saldos e acompanhe o status das suas
              solicitações com o time de RH.
            </p>
          </div>
        </div>
      </header>

      <div className="welcome-banner welcome-banner--leave">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-umbrella-beach" />
        </div>
        <div>
          <div className="welcome-banner__title">Gestão de férias e ausências</div>
          <p className="welcome-banner__text">
            Planeje seus períodos de descanso com antecedência e mantenha seu gestor informado.
            Solicitações são analisadas pelo RH em até 3 dias úteis.
          </p>
        </div>
      </div>

      <div className="leave-stats" aria-label="Resumo de férias">
        <div className="leave-stat">
          <div className="leave-stat__value">
            {summaryQuery.isLoading
              ? "…"
              : formatSensitiveCount(summaryQuery.data?.availableDays ?? 0, showValues)}
          </div>
          <div className="leave-stat__label">Dias de férias disponíveis</div>
        </div>
        <div className="leave-stat">
          <div className="leave-stat__value">
            {summaryQuery.isLoading
              ? "…"
              : formatSensitiveCount(summaryQuery.data?.pendingRequests ?? 0, showValues)}
          </div>
          <div className="leave-stat__label">Solicitação pendente de aprovação</div>
        </div>
        <div className="leave-stat">
          <div className="leave-stat__value">
            {summaryQuery.isLoading
              ? "…"
              : summaryQuery.data?.nextScheduledLabel ?? "—"}
          </div>
          <div className="leave-stat__label">Próximo período programado</div>
        </div>
      </div>

      <div className="pay-toolbar">
        <div className="pay-toolbar__filters page-filters" role="group" aria-label="Filtros">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`filter-chip${category === filter.id ? " is-active" : ""}`}
              onClick={() => setCategory(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="pay-toolbar__actions">
          <button
            type="button"
            className={`pay-toggle-values${showValues ? " is-active" : ""}`}
            aria-pressed={showValues}
            onClick={() => setShowValues((value) => !value)}
          >
            <i className={`fa-regular ${showValues ? "fa-eye" : "fa-eye-slash"}`} aria-hidden="true" />
            {showValues ? "Ocultar valores" : "Mostrar valores"}
          </button>
          <label className="pay-search page-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar serviços de ausência..."
              aria-label="Buscar serviços de ausência"
            />
          </label>
        </div>
      </div>

      {servicesQuery.isError ? (
        <p className="page-empty-note" role="alert">
          Não foi possível carregar os serviços. Verifique se a API está online.
        </p>
      ) : (
        <div className="leave-grid" aria-label="Serviços de férias e ausências">
          {servicesQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <article key={index} className="leave-card" aria-hidden="true">
                  <p>Carregando…</p>
                </article>
              ))
            : filtered.map((service) => (
                <LeaveServiceCard
                  key={service.id}
                  service={service}
                  bookmarkSaved={isSaved(bookmarkIdForLeave(service.id))}
                  onPrimaryAction={handlePrimaryAction}
                  onHelp={setHelpService}
                  onBookmark={(item) => toggleBookmark(bookmarkIdForLeave(item.id))}
                  onPortal={openPortal}
                />
              ))}
        </div>
      )}

      <p className="page-empty-note">
        Exibindo {filtered.length} serviço{filtered.length === 1 ? "" : "s"}
      </p>

      <LeaveBalanceModal
        open={balanceOpen}
        showValues={showValues}
        onToggleShowValues={() => setShowValues((v) => !v)}
        onClose={() => setBalanceOpen(false)}
      />
      <LeaveHistoryModal
        open={historyOpen}
        showValues={showValues}
        onToggleShowValues={() => setShowValues((v) => !v)}
        onClose={() => setHistoryOpen(false)}
      />
      <LeaveBancoHorasModal
        open={bancoOpen}
        showValues={showValues}
        onToggleShowValues={() => setShowValues((v) => !v)}
        onClose={() => setBancoOpen(false)}
      />
      <LeaveTeamCalendarModal open={teamOpen} onClose={() => setTeamOpen(false)} />
      <LeaveRequestModal
        open={requestService !== null}
        service={requestService}
        pending={requestMutation.isPending}
        onClose={() => setRequestService(null)}
        onSubmit={handleRequestSubmit}
      />
      <LeaveHelpModal
        open={helpService !== null}
        service={helpService}
        onClose={() => setHelpService(null)}
      />
      <LeaveRequestResultModal
        open={requestMessage !== null}
        message={requestMessage}
        onClose={() => setRequestMessage(null)}
      />
    </main>
  );
}
