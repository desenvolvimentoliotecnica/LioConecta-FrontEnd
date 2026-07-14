import type { HelpDeskServiceDto } from "../../api/types";

const CAT_LABELS: Record<string, string> = {
  incidente: "Incidente",
  solicitacao: "Solicitação",
  duvida: "Dúvida",
  urgente: "Urgente",
};

const CAT_ICONS: Record<string, string> = {
  incidente: "fa-triangle-exclamation",
  solicitacao: "fa-file-circle-plus",
  duvida: "fa-circle-question",
  urgente: "fa-bolt",
};

const STATUS_LABELS: Record<string, string> = {
  disponivel: "Disponível",
  sob_analise: "Sob análise",
  indisponivel: "Indisponível",
};

type Props = {
  service: HelpDeskServiceDto;
  bookmarkSaved: boolean;
  onAccess: (service: HelpDeskServiceDto) => void;
  onPortal: (service: HelpDeskServiceDto) => void;
  onBookmark: (service: HelpDeskServiceDto) => void;
};

/** Cards internos: só o botão Acessar — sem externo/bookmark. */
const HIDE_SECONDARY_ACTIONS = new Set([
  "abrir-chamado",
  "acompanhar-ticket",
  "base-conhecimento",
]);

export function HelpDeskServiceCard({ service, bookmarkSaved, onAccess, onPortal, onBookmark }: Props) {
  const catClass = ` benefit-card__cat--${service.category}`;
  const statusClass = ` benefit-card__status--${service.status}`;
  const showSecondaryActions = !HIDE_SECONDARY_ACTIONS.has(service.id);

  return (
    <article
      className={`benefit-card${service.featured ? " is-featured" : ""}`}
      data-cat={service.category}
    >
      <div className="benefit-card__head">
        <div
          className={`benefit-card__icon benefit-card__icon--${service.category}`}
          aria-hidden="true"
        >
          <i className={`fa-solid ${CAT_ICONS[service.category] ?? "fa-headset"}`} />
        </div>
        <div className="benefit-card__main">
          <h2 className="benefit-card__title">{service.title}</h2>
          <p className="benefit-card__desc">{service.desc}</p>
        </div>
      </div>
      <div className="benefit-card__tags">
        <span className={`benefit-card__cat${catClass}`}>
          {CAT_LABELS[service.category] ?? service.category}
        </span>
        <span className={`benefit-card__status${statusClass}`}>
          {STATUS_LABELS[service.status] ?? service.status}
        </span>
      </div>
      <div className="benefit-card__meta">
        <span>
          <i className="fa-solid fa-server" aria-hidden="true" /> {service.provider}
        </span>
      </div>
      <div className="benefit-card__footer">
        <button type="button" className="benefit-card__open" onClick={() => onAccess(service)}>
          <i className="fa-regular fa-eye" aria-hidden="true" /> Acessar
        </button>
        {showSecondaryActions ? (
          <div className="benefit-card__actions">
            <button
              type="button"
              className="benefit-card__btn"
              aria-label={`Abrir ${service.title}`}
              disabled={!service.portalUrl}
              title={service.portalUrl ? "Abrir canal externo" : "Canal externo indisponível"}
              onClick={() => onPortal(service)}
            >
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`benefit-card__btn${bookmarkSaved ? " is-saved" : ""}`}
              aria-label={`Salvar ${service.title}`}
              aria-pressed={bookmarkSaved}
              onClick={() => onBookmark(service)}
            >
              <i
                className={`${bookmarkSaved ? "fa-solid" : "fa-regular"} fa-bookmark`}
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function filterHelpDeskServices(
  items: HelpDeskServiceDto[],
  category: string,
  query: string,
): HelpDeskServiceDto[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    if (!matchesCategory) return false;
    if (!normalized) return true;
    const haystack = [item.title, item.desc, item.provider, item.category, item.status]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
