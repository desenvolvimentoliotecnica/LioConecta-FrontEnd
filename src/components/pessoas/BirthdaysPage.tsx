import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import { useBirthdays } from "../../api/hooks/useBirthdays";
import { useCreateTypedPost } from "../../api/hooks/useFeed";
import type { BirthdayPersonDto } from "../../api/types";
import { POST_TYPE_CELEBRATION } from "../../api/types";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { UserAvatar } from "../ui/UserAvatar";
import {
  BirthdayCongratulateModal,
  type BirthdayCongratulatePayload,
} from "./BirthdayCongratulateModal";
import "../../styles/birthdays-page.css";

const PERIODS = [
  { label: "Hoje", days: 1 },
  { label: "Semana", days: 7 },
  { label: "Mês", days: 31 },
] as const;

type ToastState = { type: "success" | "error"; message: string } | null;

function parseMonthDay(value?: string | null): { month: number; day: number } | null {
  if (!value) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) {
    return { month: Number(iso[2]) - 1, day: Number(iso[3]) };
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { month: date.getMonth(), day: date.getDate() };
}

function formatBirthdayLabel(value?: string | null): string {
  const parts = parseMonthDay(value);
  if (!parts) return "";
  const date = new Date(2000, parts.month, parts.day);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

function isBirthdayToday(value?: string | null): boolean {
  const parts = parseMonthDay(value);
  if (!parts) return false;
  const today = new Date();
  return parts.month === today.getMonth() && parts.day === today.getDate();
}

function profileHref(person: BirthdayPersonDto): string {
  return `/pessoas/perfil?id=${encodeURIComponent(person.slug)}`;
}

function BirthdayCard({
  person,
  celebrating,
  onCongratulate,
}: {
  person: BirthdayPersonDto;
  celebrating: boolean;
  onCongratulate: (person: BirthdayPersonDto) => void;
}) {
  const today = isBirthdayToday(person.birthDate);
  const dateLabel = formatBirthdayLabel(person.birthDate);
  const alreadyCongratulated = Boolean(person.alreadyCongratulatedByMe);
  const canCongratulate = Boolean(person.id) && !alreadyCongratulated;

  return (
    <article className={`birthdays-page__card${today ? " is-today" : ""}`}>
      <UserAvatar className="birthdays-page__avatar avatar" photoUrl={person.photoUrl} />
      <h2 className="birthdays-page__name" title={person.name}>
        {person.name}
      </h2>
      <p className="birthdays-page__role" title={person.title ?? undefined}>
        {person.title?.trim() || "Colaborador"}
      </p>
      <div className="birthdays-page__meta">
        {person.departmentName ? (
          <span className="birthdays-page__dept">{person.departmentName}</span>
        ) : null}
        {today ? <span className="birthdays-page__today-badge">Hoje</span> : null}
      </div>
      {dateLabel ? (
        <p className="birthdays-page__date">
          <i className="fa-solid fa-cake-candles" aria-hidden="true" />
          {dateLabel}
        </p>
      ) : null}
      <div className="birthdays-page__actions">
        <button
          type="button"
          className={`birthdays-page__btn birthdays-page__btn--primary${alreadyCongratulated ? " is-done" : ""}`}
          disabled={!canCongratulate || celebrating}
          onClick={() => onCongratulate(person)}
          title={
            alreadyCongratulated
              ? "Você já parabenizou esta pessoa neste ano"
              : canCongratulate
                ? undefined
                : "Não é possível parabenizar este colaborador agora"
          }
        >
          <i
            className={`fa-solid ${alreadyCongratulated ? "fa-check" : "fa-gift"}`}
            aria-hidden="true"
          />
          {alreadyCongratulated ? "Parabenizado" : "Parabenizar"}
        </button>
        <Link to={profileHref(person)} className="birthdays-page__btn birthdays-page__btn--secondary">
          <i className="fa-regular fa-user" aria-hidden="true" />
          Ver perfil
        </Link>
      </div>
    </article>
  );
}

export function BirthdaysPage() {
  const queryClient = useQueryClient();
  const [days, setDays] = useState(1);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [selectedPerson, setSelectedPerson] = useState<BirthdayPersonDto | null>(null);
  const birthdays = useBirthdays(days);
  const celebrate = useCreateTypedPost(POST_TYPE_CELEBRATION);

  const periodLabel = PERIODS.find((period) => period.days === days)?.label ?? "período";

  const items = useMemo(() => {
    const list = birthdays.data ?? [];
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return list;
    return list.filter((person) => {
      const haystack =
        `${person.name} ${person.title ?? ""} ${person.departmentName ?? ""}`.toLocaleLowerCase(
          "pt-BR",
        );
      return haystack.includes(normalized);
    });
  }, [birthdays.data, query]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3200);
  }

  function markPersonCongratulated(personId: string) {
    queryClient.setQueriesData<BirthdayPersonDto[]>(
      { queryKey: ["people", "birthdays"] },
      (current) =>
        current?.map((person) =>
          person.id === personId ? { ...person, alreadyCongratulatedByMe: true } : person,
        ),
    );
  }

  async function handleSubmitCongrats(payload: BirthdayCongratulatePayload) {
    const person = selectedPerson;
    if (!person?.id || celebrate.isPending || person.alreadyCongratulatedByMe) return;

    const metadata: Record<string, unknown> = {
      celebratedPersonId: person.id,
      celebratedPersonName: person.name,
      celebratedPersonSlug: person.slug,
      kind: "birthday",
    };

    if (payload.card) {
      metadata.birthdayCardId = payload.card.id;
      metadata.mediaUrl = payload.card.url;
      metadata.mediaType = "image";
      metadata.mediaItems = [{ url: payload.card.url, mediaType: "image" }];
    }

    try {
      await celebrate.mutateAsync({
        content: payload.message,
        metadata,
      });
      markPersonCongratulated(person.id);
      void queryClient.invalidateQueries({ queryKey: ["people", "birthdays"] });
      setSelectedPerson(null);
      showToast(
        "success",
        payload.card
          ? `Parabéns com cartão enviados para ${person.name}.`
          : `Parabéns enviados para ${person.name}.`,
      );
    } catch (error) {
      const apiMessage =
        error instanceof ApiError &&
        error.body &&
        typeof error.body === "object" &&
        "message" in error.body &&
        typeof (error.body as { message?: unknown }).message === "string"
          ? (error.body as { message: string }).message.trim()
          : "";
      showToast(
        "error",
        apiMessage || "Não foi possível enviar a parabenização. Tente novamente.",
      );
    }
  }

  return (
    <main className={`${sectionMainClass("pessoas")} birthdays-page`}>
      {toast ? (
        <div
          className={`birthdays-page__toast${toast.type === "error" ? " birthdays-page__toast--error" : ""}`}
          role="status"
        >
          <i
            className={`fa-solid ${toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}
            aria-hidden="true"
          />
          {toast.message}
        </div>
      ) : null}

      <SectionPageHead
        section="pessoas"
        title="Aniversariantes"
        current="Aniversariantes"
        description="Celebre com quem faz aniversário hoje, esta semana ou ao longo do mês."
        toolbar={
          <div className="page-toolbar" aria-label="Filtros de aniversariantes">
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
                aria-label="Buscar aniversariantes"
              />
            </label>
          </div>
        }
      />

      <section className="birthdays-page__banner" aria-live="polite">
        <div className="birthdays-page__banner-icon" aria-hidden="true">
          <i className="fa-solid fa-cake-candles" />
        </div>
        <div>
          <h2 className="birthdays-page__banner-title">Aniversariantes · {periodLabel}</h2>
          <p className="birthdays-page__banner-text">
            {birthdays.isLoading
              ? "Carregando celebrações..."
              : items.length === 0
                ? "Nenhum aniversariante neste período."
                : `${items.length} colega${items.length === 1 ? "" : "s"} para celebrar.`}
          </p>
        </div>
      </section>

      {birthdays.isLoading ? <p className="page-empty-note">Carregando aniversariantes...</p> : null}

      {!birthdays.isLoading && items.length > 0 ? (
        <section className="birthdays-page__grid" aria-label="Lista de aniversariantes">
          {items.map((person) => (
            <BirthdayCard
              key={person.id ?? person.slug}
              person={person}
              celebrating={celebrate.isPending}
              onCongratulate={(target) => setSelectedPerson(target)}
            />
          ))}
        </section>
      ) : null}

      {!birthdays.isLoading && items.length === 0 ? (
        <div className="birthdays-page__empty">
          <i className="fa-regular fa-calendar" aria-hidden="true" />
          <p>Nenhum aniversariante encontrado para os filtros selecionados.</p>
        </div>
      ) : null}

      <BirthdayCongratulateModal
        open={Boolean(selectedPerson)}
        person={selectedPerson}
        submitting={celebrate.isPending}
        onClose={() => {
          if (!celebrate.isPending) setSelectedPerson(null);
        }}
        onSubmit={(payload) => void handleSubmitCongrats(payload)}
      />
    </main>
  );
}
