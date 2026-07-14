import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  uploadHelpDeskTicketAttachment,
  useHelpDeskCreateTicket,
  useHelpDeskServices,
  useHelpDeskSummary,
} from "../../api/hooks/useHelpDesk";
import { ApiError } from "../../api/client";
import { useToggleBookmark } from "../../api/hooks/usePreferences";
import type { CreateHelpDeskTicketRequestDto, HelpDeskServiceDto, HelpDeskTicketResultDto } from "../../api/types";
import { bookmarkIdForHelpDesk } from "../../utils/money";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { useEmailCompose } from "../email/EmailComposeProvider";
import { HelpDeskServiceCard } from "./HelpDeskServiceCard";
import { HelpDeskKnowledgeModal } from "./HelpDeskKnowledgeModal";
import { HelpDeskLiveChatModal } from "./HelpDeskLiveChatModal";
import { HelpDeskOpenTicketModal } from "./HelpDeskOpenTicketModal";
import { HelpDeskPhoneModal } from "./HelpDeskPhoneModal";
import { HelpDeskTicketListPanel } from "./HelpDeskTicketListPanel";
import { HelpDeskTicketResultModal } from "./HelpDeskTicketResultModal";
import { HelpDeskTrackTicketModal } from "./HelpDeskTrackTicketModal";
import "../../styles/contracheque-page.css";
import "../../styles/beneficios-page.css";
import "../../styles/help-desk-page.css";
import "../../styles/help-desk-modal.css";

function apiErrorDetail(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.body && typeof error.body === "object") {
      const record = error.body as Record<string, unknown>;
      const detail = record.detail ?? record.title ?? record.message;
      if (typeof detail === "string" && detail.trim()) {
        return detail;
      }
    }

    if (typeof error.body === "string" && error.body.trim()) {
      return error.body;
    }

    if (error.status === 422) {
      return "Seu usuário não está cadastrado no GLPI. Solicite ao TI o cadastro com o mesmo e-mail corporativo.";
    }

    if (error.status === 502) {
      return "Falha na integração com o GLPI. Verifique a configuração ou tente novamente em instantes.";
    }

    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Não foi possível registrar o chamado. Tente novamente.";
}

export function HelpDeskPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [openTicket, setOpenTicket] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [knowledgeService, setKnowledgeService] = useState<HelpDeskServiceDto | null>(null);
  const [chatService, setChatService] = useState<HelpDeskServiceDto | null>(null);
  const [phoneService, setPhoneService] = useState<HelpDeskServiceDto | null>(null);
  const [ticketResult, setTicketResult] = useState<HelpDeskTicketResultDto | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);

  const summaryQuery = useHelpDeskSummary();
  const servicesQuery = useHelpDeskServices();
  const createMutation = useHelpDeskCreateTicket();
  const { openCompose } = useEmailCompose();
  const { toggle: toggleBookmark, isSaved } = useToggleBookmark();

  useEffect(() => {
    if (searchParams.get("track") !== "1") return;
    setTrackOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("track");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);

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

  const handleCreateTicket = async (payload: CreateHelpDeskTicketRequestDto, files: File[]) => {
    setCreateError(null);
    setCreatePending(true);
    let created: HelpDeskTicketResultDto | null = null;
    try {
      created = await createMutation.mutateAsync(payload);
      if (files.length > 0) {
        const ticketId = created.externalRef?.trim();
        if (!ticketId) {
          throw new Error("Chamado criado, mas o protocolo GLPI não foi retornado para anexar arquivos.");
        }
        for (const file of files) {
          await uploadHelpDeskTicketAttachment(ticketId, file);
        }
      }
      setOpenTicket(false);
      setCreateError(null);
      setTicketResult(created);
    } catch (error) {
      const detail = apiErrorDetail(error);
      if (created?.externalRef) {
        setCreateError(
          `Chamado #${created.externalRef} aberto no GLPI, mas falhou o envio do anexo: ${detail}`,
        );
        setTicketResult(created);
      } else {
        setCreateError(detail);
      }
    } finally {
      setCreatePending(false);
    }
  };

  const pendingTickets = summaryQuery.data?.pendingTickets ?? 0;
  const inProgressTickets = summaryQuery.data?.inProgressTickets ?? 0;
  const avgResponse = summaryQuery.data?.avgResponseLabel ?? "2h críticos · 8h solicitações";

  const formatCount = (count: number, singular: string, plural: string) =>
    count === 1 ? `1 ${singular}` : `${count} ${plural}`;

  const queueLabel = summaryQuery.isLoading
    ? "carregando fila…"
    : `${formatCount(pendingTickets, "Pendente", "Pendentes")} · ${formatCount(
        inProgressTickets,
        "Em atendimento",
        "Em atendimento",
      )}`;

  return (
    <main className={sectionMainClass("ti")}>
      <SectionPageHead
        section="ti"
        title="Help Desk"
        current="Help Desk"
        description="Abra chamados, acompanhe tickets em andamento e consulte canais de suporte técnico da Liotécnica."
        toolbar={
          <div className="hd-header-summary" aria-live="polite">
            <p className="hd-header-summary__title">
              Central de atendimento TI — {queueLabel}
            </p>
            <p className="hd-header-summary__text">
              Tempo médio de resposta: {avgResponse}. Consulte a base de conhecimento ou abra um
              ticket pelo portal.
            </p>
          </div>
        }
      />

      {servicesQuery.isError ? (
        <p className="page-empty-note" role="alert">
          Não foi possível carregar os serviços. Verifique se a API está online.
        </p>
      ) : null}

      <div className="benefits-grid" aria-label="Help Desk">
        {servicesQuery.isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="benefit-card" aria-hidden="true">
                <p>Carregando…</p>
              </article>
            ))
          : services.map((service) => (
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

      <HelpDeskTicketListPanel canViewAllTickets={summaryQuery.data?.canViewAllTickets ?? false} />

      <HelpDeskOpenTicketModal
        open={openTicket}
        pending={createPending || createMutation.isPending}
        errorMessage={createError}
        onClose={() => {
          setOpenTicket(false);
          setCreateError(null);
        }}
        onSubmit={(payload, files) => {
          void handleCreateTicket(payload, files);
        }}
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
