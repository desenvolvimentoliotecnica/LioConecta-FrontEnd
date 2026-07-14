import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  uploadHelpDeskTicketAttachment,
  useHelpDeskCreateTicket,
  useHelpDeskSummary,
} from "../../api/hooks/useHelpDesk";
import { ApiError } from "../../api/client";
import type { CreateHelpDeskTicketRequestDto, HelpDeskServiceDto, HelpDeskTicketResultDto } from "../../api/types";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { HelpDeskKnowledgeModal } from "./HelpDeskKnowledgeModal";
import { HelpDeskOpenTicketModal } from "./HelpDeskOpenTicketModal";
import { HelpDeskTicketListPanel } from "./HelpDeskTicketListPanel";
import { HelpDeskTicketResultModal } from "./HelpDeskTicketResultModal";
import { HelpDeskTrackTicketModal } from "./HelpDeskTrackTicketModal";
import "../../styles/contracheque-page.css";
import "../../styles/beneficios-page.css";
import "../../styles/help-desk-page.css";
import "../../styles/help-desk-modal.css";

const KNOWLEDGE_SERVICE: HelpDeskServiceDto = {
  id: "base-conhecimento",
  title: "Base de conhecimento",
  desc: "Artigos, tutoriais e soluções para problemas frequentes de hardware, software e acesso.",
  category: "duvida",
  provider: "Wiki TI",
  status: "disponivel",
  featured: false,
  action: "Consultar",
  helpText: "Busque por palavra-chave antes de abrir chamado. Muitos problemas comuns já possuem solução documentada.",
  portalUrl: "/documentos/wiki",
};

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
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [ticketResult, setTicketResult] = useState<HelpDeskTicketResultDto | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createPending, setCreatePending] = useState(false);

  const summaryQuery = useHelpDeskSummary();
  const createMutation = useHelpDeskCreateTicket();

  useEffect(() => {
    if (searchParams.get("track") !== "1") return;
    setTrackOpen(true);
    const next = new URLSearchParams(searchParams);
    next.delete("track");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

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
        titleActions={
          <div className="hd-header-actions">
            <button
              type="button"
              className="hd-header-actions__btn hd-header-actions__btn--primary"
              onClick={() => setOpenTicket(true)}
            >
              <i className="fa-solid fa-ticket" aria-hidden="true" />
              Abrir chamado
            </button>
            <button
              type="button"
              className="hd-header-actions__btn"
              onClick={() => setKnowledgeOpen(true)}
            >
              <i className="fa-solid fa-book-open" aria-hidden="true" />
              Base de conhecimento
            </button>
          </div>
        }
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
        open={knowledgeOpen}
        service={KNOWLEDGE_SERVICE}
        onClose={() => setKnowledgeOpen(false)}
      />
      <HelpDeskTicketResultModal
        open={ticketResult !== null}
        result={ticketResult}
        onClose={() => setTicketResult(null)}
      />
    </main>
  );
}
