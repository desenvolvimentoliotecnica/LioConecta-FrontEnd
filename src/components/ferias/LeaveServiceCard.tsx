import type { LeaveServiceDto } from "../../api/types";

const CAT_LABELS: Record<string, string> = {
  ferias: "Férias",
  licenca: "Licença",
  afastamento: "Afastamento",
  consulta: "Consulta",
  banco: "Banco de horas",
};

const CAT_ICONS: Record<string, string> = {
  ferias: "fa-umbrella-beach",
  licenca: "fa-baby",
  afastamento: "fa-briefcase-medical",
  consulta: "fa-clock-rotate-left",
  banco: "fa-hourglass-half",
};

function actionIcon(action: string): string {
  if (action === "Abrir") return "fa-solid fa-arrow-up-right-from-square";
  if (["Consultar"].includes(action)) return "fa-regular fa-eye";
  if (["Registrar", "Solicitar"].includes(action)) return "fa-solid fa-paper-plane";
  return "fa-regular fa-eye";
}

type Props = {
  service: LeaveServiceDto;
  bookmarkSaved: boolean;
  onPrimaryAction: (service: LeaveServiceDto) => void;
  onHelp: (service: LeaveServiceDto) => void;
  onBookmark: (service: LeaveServiceDto) => void;
  onPortal?: (service: LeaveServiceDto) => void;
};

export function LeaveServiceCard({
  service,
  bookmarkSaved,
  onPrimaryAction,
  onHelp,
  onBookmark,
  onPortal,
}: Props) {
  const catClass = service.category !== "ferias" ? ` leave-card__cat--${service.category}` : "";

  return (
    <article className={`leave-card${service.featured ? " is-featured" : ""}`} data-cat={service.category}>
      <div className="leave-card__head">
        <div className={`leave-card__icon leave-card__icon--${service.category}`} aria-hidden="true">
          <i className={`fa-solid ${CAT_ICONS[service.category] ?? "fa-calendar"}`} />
        </div>
        <div className="leave-card__main">
          <h2 className="leave-card__title">{service.title}</h2>
          <p className="leave-card__desc">{service.desc}</p>
        </div>
      </div>
      <div className="leave-card__tags">
        <span className={`leave-card__cat${catClass}`}>{CAT_LABELS[service.category] ?? service.category}</span>
        {service.online ? <span className="leave-card__badge leave-card__badge--online">Online</span> : null}
      </div>
      <div className="leave-card__meta">
        <span>
          <i className="fa-regular fa-clock" aria-hidden="true" /> {service.sla}
        </span>
      </div>
      <div className="leave-card__footer">
        <button
          type="button"
          className="leave-card__open"
          disabled={!service.online && service.action !== "Consultar"}
          title={service.online ? undefined : "Serviço offline — encaminhe documentos ao RH"}
          onClick={() => onPrimaryAction(service)}
        >
          <i className={actionIcon(service.action)} aria-hidden="true" /> {service.action}
        </button>
        <div className="leave-card__actions">
          {service.portalUrl && onPortal ? (
            <button
              type="button"
              className="leave-card__btn"
              aria-label={`Portal ${service.title}`}
              onClick={() => onPortal(service)}
            >
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            className="leave-card__btn"
            aria-label={`Ajuda ${service.title}`}
            onClick={() => onHelp(service)}
          >
            <i className="fa-regular fa-circle-question" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`leave-card__btn${bookmarkSaved ? " is-saved" : ""}`}
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

export function filterLeaveServices(
  services: LeaveServiceDto[],
  category: string,
  query: string,
): LeaveServiceDto[] {
  const normalized = query.trim().toLowerCase();
  return services.filter((service) => {
    const categoryMatch = category === "all" || service.category === category;
    if (!categoryMatch) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const haystack = `${service.title} ${service.desc} ${service.category} ${service.sla}`.toLowerCase();
    return haystack.includes(normalized);
  });
}
