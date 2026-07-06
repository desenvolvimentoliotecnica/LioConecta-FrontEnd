import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useHelpDeskCreateTicket,
  useHelpDeskServices,
  useHelpDeskSummary,
} from "../../api/hooks/useHelpDesk";
import { useToggleBookmark } from "../../api/hooks/usePreferences";
import type { HelpDeskServiceDto, HelpDeskTicketResultDto } from "../../api/types";
import { bookmarkIdForHelpDesk } from "../../utils/money";
import { useEmailCompose } from "../email/EmailComposeProvider";
import { filterHelpDeskServices, HelpDeskServiceCard } from "./HelpDeskServiceCard";
import { HelpDeskKnowledgeModal } from "./HelpDeskKnowledgeModal";
import { HelpDeskLiveChatModal } from "./HelpDeskLiveChatModal";
import { HelpDeskOpenTicketModal } from "./HelpDeskOpenTicketModal";
import { HelpDeskPhoneModal } from "./HelpDeskPhoneModal";
import { HelpDeskTicketResultModal } from "./HelpDeskTicketResultModal";
import { HelpDeskTrackTicketModal } from "./HelpDeskTrackTicketModal";
import "../../styles/contracheque-page.css";
import "../../styles/beneficios-page.css";
import "../../styles/help-desk-page.css";
import "../../styles/help-desk-modal.css";

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "incidente", label: "Incidentes" },
  { id: "solicitacao", label: "Solicitações" },
  { id: "duvida", label: "Dúvidas" },
  { id: "urgente", label: "Urgente" },
] as const;

export function HelpDeskPage() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [openTicket, setOpenTicket] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [knowledgeService, setKnowledgeService] = useState<HelpDeskServiceDto | null>(null);
  const [chatService, setChatService] = useState<HelpDeskServiceDto | null>(null);
  const [phoneService, setPhoneService] = useState<HelpDeskServiceDto | null>(null);
  const [ticketResult, setTicketResult] = useState<HelpDeskTicketResultDto | null>(null);

  const summaryQuery = useHelpDeskSummary();
  const servicesQuery = useHelpDeskServices();
  const createMutation = useHelpDeskCreateTicket();
  const { openCompose } = useEmailCompose();
  const { toggle: toggleBookmark, isSaved } = useToggleBookmark();

  const filtered = useMemo(
    () => filterHelpDeskServices(servicesQuery.data ?? [], category, query),
    [servicesQuery.data, category, query],
  );

  const openPortal = (service: HelpDeskServiceDto) => {
    if (!service.portalUrl) return;
    if (service.portalUrl.startsWith("mailto:")) {
      window.location.href = service.portalUrl;
      return;
    }
    window.open(service.portalUrl, "_blank", "noopener,noreferrer");
  };

  const handleAccess = (service: HelpDeskServiceDto) => {
    switch (service.id) {
      case "abrir-chamado":
        setOpenTicket(true);
        break;
      case "acompanhar-ticket":
        setTrackOpen(true);
        break;
      case "base-conhecimento":
        setKnowledgeService(service);
        break;
      case "chat-ao-vivo":
        setChatService(service);
        break;
      case "email-suporte":
        openCompose({
          to: [{ email: "ti.suporte@liotecnica.com.br", name: "Suporte TI" }],
          lockedTo: true,
          subject: "Suporte TI — ",
          source: "help-desk",
        });
        break;
      case "telefone-plantao":
        setPhoneService(service);
        break;
      default:
        if (service.portalUrl) {
          openPortal(service);
        }
        break;
    }
  };

  const handleCreateTicket = (payload: {
    subject: string;
    priority: string;
    category: string;
    description: string;
  }) => {
    createMutation.mutate(payload, {
      onSuccess: (result) => {
        setOpenTicket(false);
        setTicketResult(result);
      },
    });
  };

  const openTickets = summaryQuery.data?.openTickets ?? 0;
  const avgResponse = summaryQuery.data?.avgResponseLabel ?? "2h críticos · 8h solicitações";

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span>Serviços</span>
          <span className="breadcrumb__sep">/</span>
          <span>TI &amp; Suporte</span>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Help Desk</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Help Desk</h1>
            <p className="page-header__desc">
              Abra chamados, acompanhe tickets em andamento e consulte canais de suporte técnico da
              Liotécnica.
            </p>
          </div>
        </div>
      </header>

      <div className="welcome-banner welcome-banner--help-desk">
        <div className="welcome-banner__icon" aria-hidden="true">
          <i className="fa-solid fa-headset" />
        </div>
        <div>
          <div className="welcome-banner__title">
            {summaryQuery.isLoading
              ? "Carregando central de atendimento…"
              : `Central de atendimento TI — ${openTickets} chamado${openTickets === 1 ? "" : "s"} aberto${openTickets === 1 ? "" : "s"}`}
          </div>
          <p className="welcome-banner__text">
            Tempo médio de resposta: {avgResponse}. Use o chat interno ou abra um ticket pelo portal.
          </p>
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
        <label className="pay-search page-search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar chamados e artigos..."
            aria-label="Buscar chamados e artigos"
          />
        </label>
      </div>

      {servicesQuery.isError ? (
        <p className="page-empty-note" role="alert">
          Não foi possível carregar os serviços. Verifique se a API está online.
        </p>
      ) : null}

      <div className="benefits-grid" aria-label="Help Desk">
        {servicesQuery.isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <article key={index} className="benefit-card" aria-hidden="true">
                <p>Carregando…</p>
              </article>
            ))
          : filtered.map((service) => (
              <HelpDeskServiceCard
                key={service.id}
                service={service}
                bookmarkSaved={isSaved(bookmarkIdForHelpDesk(service.id))}
                onAccess={handleAccess}
                onPortal={openPortal}
                onBookmark={(item) => toggleBookmark(bookmarkIdForHelpDesk(item.id))}
              />
            ))}
      </div>

      <p className="page-empty-note">
        Exibindo {filtered.length} serviço{filtered.length === 1 ? "" : "s"}
      </p>

      <HelpDeskOpenTicketModal
        open={openTicket}
        pending={createMutation.isPending}
        onClose={() => setOpenTicket(false)}
        onSubmit={handleCreateTicket}
      />
      <HelpDeskTrackTicketModal
        open={trackOpen}
        canViewAllTickets={summaryQuery.data?.canViewAllTickets ?? false}
        onClose={() => setTrackOpen(false)}
      />
      <HelpDeskKnowledgeModal
        open={knowledgeService !== null}
        service={knowledgeService}
        onClose={() => setKnowledgeService(null)}
      />
      <HelpDeskLiveChatModal
        open={chatService !== null}
        service={chatService}
        onClose={() => setChatService(null)}
        onOpenTeams={() => {
          if (chatService?.portalUrl) openPortal(chatService);
        }}
      />
      <HelpDeskPhoneModal
        open={phoneService !== null}
        service={phoneService}
        onClose={() => setPhoneService(null)}
      />
      <HelpDeskTicketResultModal
        open={ticketResult !== null}
        result={ticketResult}
        onClose={() => setTicketResult(null)}
      />
    </main>
  );
}
