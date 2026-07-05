import type { BenefitListItemDto } from "../../api/types";

const CAT_LABELS: Record<string, string> = {
  saude: "Saúde",
  alimentacao: "Alimentação",
  mobilidade: "Mobilidade",
  qualidade: "Qualidade de vida",
  familia: "Família",
};

const CAT_ICONS: Record<string, string> = {
  saude: "fa-heart-pulse",
  alimentacao: "fa-utensils",
  mobilidade: "fa-bus",
  qualidade: "fa-spa",
  familia: "fa-people-roof",
};

const STATUS_LABELS: Record<string, string> = {
  obrigatorio: "Obrigatório",
  opcional: "Opcional",
  flexivel: "Flexível",
};

type Props = {
  benefit: BenefitListItemDto;
  bookmarkSaved: boolean;
  onConsult: (benefit: BenefitListItemDto) => void;
  onPortal: (benefit: BenefitListItemDto) => void;
  onBookmark: (benefit: BenefitListItemDto) => void;
};

export function BeneficioCard({ benefit, bookmarkSaved, onConsult, onPortal, onBookmark }: Props) {
  const catClass = benefit.category !== "saude" ? ` benefit-card__cat--${benefit.category}` : "";
  const statusClass =
    benefit.status === "obrigatorio"
      ? " benefit-card__status--obrigatorio"
      : benefit.status === "flexivel"
        ? " benefit-card__status--flexivel"
        : "";

  return (
    <article
      className={`benefit-card${benefit.featured ? " is-featured" : ""}`}
      data-cat={benefit.category}
    >
      <div className="benefit-card__head">
        <div className={`benefit-card__icon benefit-card__icon--${benefit.category}`} aria-hidden="true">
          <i className={`fa-solid ${CAT_ICONS[benefit.category] ?? "fa-gift"}`} />
        </div>
        <div className="benefit-card__main">
          <h2 className="benefit-card__title">{benefit.title}</h2>
          <p className="benefit-card__desc">{benefit.desc}</p>
        </div>
      </div>
      <div className="benefit-card__tags">
        <span className={`benefit-card__cat${catClass}`}>
          {CAT_LABELS[benefit.category] ?? benefit.category}
        </span>
        <span className={`benefit-card__status${statusClass}`}>
          {STATUS_LABELS[benefit.status] ?? benefit.status}
        </span>
      </div>
      <div className="benefit-card__meta">
        <span>
          <i className="fa-solid fa-building" aria-hidden="true" /> {benefit.provider}
        </span>
      </div>
      <div className="benefit-card__footer">
        <button type="button" className="benefit-card__open" onClick={() => onConsult(benefit)}>
          <i className="fa-regular fa-eye" aria-hidden="true" /> Consultar
        </button>
        <div className="benefit-card__actions">
          <button
            type="button"
            className="benefit-card__btn"
            aria-label={`Portal ${benefit.title}`}
            disabled={!benefit.portalUrl}
            title={benefit.portalUrl ? "Abrir portal do benefício" : "Portal indisponível"}
            onClick={() => onPortal(benefit)}
          >
            <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`benefit-card__btn${bookmarkSaved ? " is-saved" : ""}`}
            aria-label={`Salvar ${benefit.title}`}
            aria-pressed={bookmarkSaved}
            onClick={() => onBookmark(benefit)}
          >
            <i className={`${bookmarkSaved ? "fa-solid" : "fa-regular"} fa-bookmark`} aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function filterBenefits(
  items: BenefitListItemDto[],
  category: string,
  query: string,
): BenefitListItemDto[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    const matchesCategory = category === "all" || item.category === category;
    if (!matchesCategory) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    const haystack = [item.title, item.desc, item.provider, item.category, item.status]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
