import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNewHires } from "../../api/hooks/useF3";
import type { NewHirePersonDto } from "../../api/types";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { UserAvatar } from "../ui/UserAvatar";
import "../../styles/new-hires-page.css";

const PERIODS = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
] as const;

function formatHireDate(person: NewHirePersonDto): string {
  const value = person.hiredAt ?? person.hireDate;
  if (!value) return "";
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  const date = iso
    ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function NewHireCard({ person }: { person: NewHirePersonDto }) {
  const hireLabel = formatHireDate(person);

  return (
    <article className="new-hires-page__card">
      <UserAvatar className="new-hires-page__avatar avatar" photoUrl={person.photoUrl} />
      <h2 className="new-hires-page__name" title={person.name}>
        {person.name}
      </h2>
      <p className="new-hires-page__role" title={person.title ?? undefined}>
        {person.title?.trim() || "Colaborador"}
      </p>
      <div className="new-hires-page__meta">
        {person.departmentName ? (
          <span className="new-hires-page__dept">{person.departmentName}</span>
        ) : null}
      </div>
      {hireLabel ? (
        <p className="new-hires-page__date">
          <i className="fa-solid fa-calendar-day" aria-hidden="true" />
          Entrada: {hireLabel}
        </p>
      ) : (
        <p className="new-hires-page__date">
          <i className="fa-solid fa-calendar-day" aria-hidden="true" />
          Data de entrada não informada
        </p>
      )}
      <div className="new-hires-page__actions">
        <Link
          to={`/pessoas/perfil?id=${encodeURIComponent(person.slug)}`}
          className="new-hires-page__btn"
        >
          <i className="fa-regular fa-user" aria-hidden="true" />
          Ver perfil
        </Link>
      </div>
    </article>
  );
}

export function NewHiresPage() {
  const [days, setDays] = useState(30);
  const [query, setQuery] = useState("");
  const hires = useNewHires(days);

  const periodLabel = PERIODS.find((period) => period.days === days)?.label ?? `${days} dias`;

  const items = useMemo(() => {
    const list = hires.data ?? [];
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return list;
    return list.filter((person) => {
      const haystack =
        `${person.name} ${person.title ?? ""} ${person.departmentName ?? ""}`.toLocaleLowerCase(
          "pt-BR",
        );
      return haystack.includes(normalized);
    });
  }, [hires.data, query]);

  return (
    <main className={`${sectionMainClass("pessoas")} new-hires-page`}>
      <SectionPageHead
        section="pessoas"
        title="Novos colaboradores"
        current="Novos colaboradores"
        description="Conheça quem acabou de chegar à LioConecta e acompanhe as admissões recentes."
        toolbar={
          <div className="page-toolbar" aria-label="Filtros de novos colaboradores">
            <div className="page-toolbar__filters">
              <div className="page-filters" role="group" aria-label="Filtros por período">
                {PERIODS.map((period) => (
                  <button
                    key={period.days}
                    type="button"
                    className={`filter-chip${days === period.days ? " is-active" : ""}`}
                    onClick={() => setDays(period.days)}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="page-search">
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                className="page-search__input"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome..."
                aria-label="Buscar novos colaboradores"
              />
            </label>
          </div>
        }
      />

      <section className="new-hires-page__banner" aria-live="polite">
        <div className="new-hires-page__banner-icon" aria-hidden="true">
          <i className="fa-solid fa-hand-sparkles" />
        </div>
        <div>
          <h2 className="new-hires-page__banner-title">Boas-vindas · últimos {periodLabel}</h2>
          <p className="new-hires-page__banner-text">
            {hires.isLoading
              ? "Carregando admissões..."
              : items.length === 0
                ? "Nenhuma admissão neste período."
                : `${items.length} novo${items.length === 1 ? "" : "s"} colaborador${items.length === 1 ? "" : "es"} no período.`}
          </p>
        </div>
      </section>

      {hires.isLoading ? <p className="page-empty-note">Carregando colaboradores...</p> : null}

      {!hires.isLoading && items.length > 0 ? (
        <section className="new-hires-page__grid" aria-label="Lista de novos colaboradores">
          {items.map((person) => (
            <NewHireCard key={person.id} person={person} />
          ))}
        </section>
      ) : null}

      {!hires.isLoading && items.length === 0 ? (
        <div className="new-hires-page__empty" role="status">
          <div className="new-hires-page__empty-icon" aria-hidden="true">
            <i className="fa-solid fa-user-plus" />
          </div>
          <h2 className="new-hires-page__empty-title">Nenhum novo colaborador neste período</h2>
          <p className="new-hires-page__empty-text">
            Não há admissões nos últimos {periodLabel}. Amplie o período nos filtros acima ou volte
            mais tarde para conhecer quem chegou à Lio.
          </p>
        </div>
      ) : null}
    </main>
  );
}
