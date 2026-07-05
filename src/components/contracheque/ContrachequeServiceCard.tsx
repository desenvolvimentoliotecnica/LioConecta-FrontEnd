import type { PayslipServiceDto } from "../../api/types";

const CAT_LABELS: Record<string, string> = {
  holerite: "Holerite",
  historico: "Histórico",
  documento: "Documento",
  informe: "Informe",
  consulta: "Consulta",
};

const CAT_ICONS: Record<string, string> = {
  holerite: "fa-file-invoice-dollar",
  historico: "fa-clock-rotate-left",
  documento: "fa-file-lines",
  informe: "fa-receipt",
  consulta: "fa-circle-question",
};

function actionIcon(action: string): string {
  if (action === "Baixar") return "fa-solid fa-download";
  if (["Visualizar", "Consultar", "Emitir"].includes(action)) return "fa-regular fa-eye";
  return "fa-solid fa-paper-plane";
}

type Props = {
  service: PayslipServiceDto;
  bookmarkSaved: boolean;
  onPrimaryAction: (service: PayslipServiceDto) => void;
  onHelp: (service: PayslipServiceDto) => void;
  onBookmark: (service: PayslipServiceDto) => void;
};

export function ContrachequeServiceCard({
  service,
  bookmarkSaved,
  onPrimaryAction,
  onHelp,
  onBookmark,
}: Props) {
  const catClass = service.category !== "holerite" ? ` pay-card__cat--${service.category}` : "";

  return (
    <article className={`pay-card${service.featured ? " is-featured" : ""}`} data-cat={service.category}>
      <div className="pay-card__head">
        <div className={`pay-card__icon pay-card__icon--${service.category}`} aria-hidden="true">
          <i className={`fa-solid ${CAT_ICONS[service.category] ?? "fa-file-invoice"}`} />
        </div>
        <div className="pay-card__main">
          <h2 className="pay-card__title">{service.title}</h2>
          <p className="pay-card__desc">{service.desc}</p>
        </div>
      </div>
      <div className="pay-card__tags">
        <span className={`pay-card__cat${catClass}`}>{CAT_LABELS[service.category] ?? service.category}</span>
        {service.online ? <span className="pay-card__badge pay-card__badge--online">Online</span> : null}
      </div>
      <div className="pay-card__meta">
        <span>
          <i className="fa-regular fa-clock" aria-hidden="true" /> {service.sla}
        </span>
      </div>
      <div className="pay-card__footer">
        <button
          type="button"
          className="pay-card__open"
          disabled={!service.online}
          title={service.online ? undefined : "Serviço offline — solicite via RH"}
          onClick={() => onPrimaryAction(service)}
        >
          <i className={actionIcon(service.action)} aria-hidden="true" /> {service.action}
        </button>
        <div className="pay-card__actions">
          <button
            type="button"
            className="pay-card__btn"
            aria-label={`Ajuda ${service.title}`}
            onClick={() => onHelp(service)}
          >
            <i className="fa-regular fa-circle-question" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`pay-card__btn${bookmarkSaved ? " is-saved" : ""}`}
            aria-label={`Salvar ${service.title}`}
            aria-pressed={bookmarkSaved}
            onClick={() => onBookmark(service)}
          >
            <i className={`${bookmarkSaved ? "fa-solid" : "fa-regular"} fa-bookmark`} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function filterServices(
  services: PayslipServiceDto[],
  category: string,
  query: string,
): PayslipServiceDto[] {
  const normalized = query.trim().toLowerCase();
  return services.filter((service) => {
    const categoryMatch = category === "all" || service.category === category;
    if (!categoryMatch) {
      return false;
    }

    if (!normalized) {
      return true;
    }

    const haystack = `${service.title} ${service.desc} ${service.category}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
