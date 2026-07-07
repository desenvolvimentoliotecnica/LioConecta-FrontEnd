import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useCopyMenuWeek,
  useSaveDailyMenu,
  useSendMenuEmail,
  useWeeklyMenu,
} from "../../api/hooks/useFacilitiesMenu";
import { useMenuEditorSettings } from "../../api/hooks/useMenuEditorSettings";
import { useMe } from "../../api/hooks/useMe";
import type { DailyMenuDto } from "../../api/types";
import {
  addDaysToDateKey,
  canEditMenu,
  createEmptyDailyMenu,
  defaultWeekStartForToday,
  formatWeekRangeLabel,
  getWeekDates,
} from "../../config/facilities/menu";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import { CardapioDayCards } from "./CardapioDayCards";
import { CardapioSendEmailModal } from "./CardapioSendEmailModal";
import {
  applySectionToWeek,
  CardapioWeekGrid,
  toggleDayHoliday,
  updateDaySection,
} from "./CardapioWeekGrid";
import "../../styles/cardapio-page.css";

type Toast = { type: "success" | "error"; message: string } | null;

export function CardapioPage() {
  const { data: me } = useMe();
  const { data: editorSettings, isError: editorSettingsError } = useMenuEditorSettings();
  const canEdit = !editorSettingsError && canEditMenu(me, editorSettings);

  const [weekStart, setWeekStart] = useState(defaultWeekStartForToday);
  const [draftDays, setDraftDays] = useState<DailyMenuDto[]>([]);
  const [toast, setToast] = useState<Toast>(null);
  const [emailOpen, setEmailOpen] = useState(false);

  const weekQuery = useWeeklyMenu(weekStart);
  const saveMutation = useSaveDailyMenu();
  const copyWeekMutation = useCopyMenuWeek();
  const sendEmailMutation = useSendMenuEmail();

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  useEffect(() => {
    if (!weekQuery.data) return;
    setDraftDays(
      weekQuery.data.days.map((day) => ({
        ...day,
        meals: day.meals.length > 0 ? day.meals : createEmptyDailyMenu(day.date).meals,
      })),
    );
  }, [weekQuery.data]);

  const displayDays =
    draftDays.length > 0 ? draftDays : weekDates.map((date) => createEmptyDailyMenu(date));

  const publishedCount = displayDays.filter((day) => day.published).length;

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 4500);
  }, []);

  const handleCellChange = (date: string, sectionKey: string, value: string) => {
    setDraftDays((current) =>
      current.map((day) => (day.date === date ? updateDaySection(day, sectionKey, value) : day)),
    );
  };

  const handleApplyRowToWeek = (sectionKey: string, value: string) => {
    setDraftDays((current) => applySectionToWeek(current, sectionKey, value));
  };

  const handleToggleHoliday = (date: string) => {
    setDraftDays((current) => current.map((day) => (day.date === date ? toggleDayHoliday(day) : day)));
  };

  const persistDay = async (day: DailyMenuDto, published: boolean) => {
    await saveMutation.mutateAsync({
      date: day.date,
      body: {
        dayStatus: day.dayStatus,
        dayStatusLabel: day.dayStatusLabel,
        meals: day.meals,
        notes: day.notes,
        published,
      },
    });
  };

  const handleSaveWeek = async (publish: boolean) => {
    try {
      for (const day of displayDays) {
        await persistDay({ ...day, published: publish ? true : day.published }, publish ? true : day.published);
      }
      showToast("success", publish ? "Semana publicada com sucesso." : "Alterações salvas.");
      void weekQuery.refetch();
    } catch {
      showToast("error", "Não foi possível salvar o cardápio. Tente novamente.");
    }
  };

  const handleCopyPreviousWeek = async () => {
    const sourceWeekStart = addDaysToDateKey(weekStart, -7);
    try {
      await copyWeekMutation.mutateAsync({
        targetWeekStart: weekStart,
        body: { sourceWeekStart },
      });
      showToast("success", "Semana anterior copiada.");
      void weekQuery.refetch();
    } catch {
      showToast("error", "Não foi possível copiar a semana anterior.");
    }
  };

  const handleSendEmail = async (payload: { recipients: string[]; includePdf: boolean }) => {
    try {
      const result = await sendEmailMutation.mutateAsync({
        weekStart,
        recipients: payload.recipients,
        includePdf: payload.includePdf,
      });
      showToast("success", result.message);
      setEmailOpen(false);
    } catch {
      showToast("error", "Não foi possível enviar o e-mail.");
    }
  };

  return (
    <main className={`${sectionMainClass("facilities")} cardapio-page`}>
      <SectionPageHead
        section="facilities"
        title="Gestão de cardápio"
        description="Consulte e edite o cardápio semanal do refeitório. Publicações aparecem automaticamente no Calendário."
        current="Cardápio"
        actions={
          canEdit ? (
            <div className="cardapio-page__actions">
              <button
                type="button"
                className="cardapio-page__btn"
                disabled={saveMutation.isPending}
                onClick={() => void handleSaveWeek(false)}
              >
                Salvar rascunho
              </button>
              <button
                type="button"
                className="cardapio-page__btn cardapio-page__btn--primary"
                disabled={saveMutation.isPending}
                onClick={() => void handleSaveWeek(true)}
              >
                Publicar semana
              </button>
              <button
                type="button"
                className="cardapio-page__btn"
                disabled={copyWeekMutation.isPending}
                onClick={() => void handleCopyPreviousWeek()}
              >
                Copiar semana anterior
              </button>
              <button
                type="button"
                className="cardapio-page__btn"
                disabled={sendEmailMutation.isPending}
                onClick={() => setEmailOpen(true)}
              >
                Enviar por e-mail
              </button>
            </div>
          ) : (
            <Link className="cardapio-page__btn cardapio-page__btn--primary" to="/calendario">
              Ver no calendário
            </Link>
          )
        }
      />

      {toast ? (
        <div className={`cardapio-page__toast cardapio-page__toast--${toast.type}`} role="status">
          {toast.message}
        </div>
      ) : null}

      <section className="cardapio-page__toolbar" aria-label="Navegação da semana">
        <button
          type="button"
          className="cardapio-page__nav-btn"
          onClick={() => setWeekStart(addDaysToDateKey(weekStart, -7))}
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true" /> Semana anterior
        </button>
        <div className="cardapio-page__week-label">
          <h2>Cardápio Semanal — {formatWeekRangeLabel(weekStart)}</h2>
          <p>
            {publishedCount} de {weekDates.length} dias publicados
            {!canEdit ? " · Modo consulta" : ""}
          </p>
        </div>
        <button
          type="button"
          className="cardapio-page__nav-btn"
          onClick={() => setWeekStart(addDaysToDateKey(weekStart, 7))}
        >
          Próxima semana <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </section>

      {weekQuery.isLoading ? <p className="cardapio-page__loading">Carregando cardápio…</p> : null}

      {weekQuery.isError ? (
        <p className="cardapio-page__error" role="alert">
          Não foi possível carregar o cardápio. Verifique a conexão com a API.
        </p>
      ) : null}

      <div className="cardapio-page__desktop">
        <CardapioWeekGrid
          days={displayDays}
          canEdit={canEdit}
          onCellChange={handleCellChange}
          onApplyRowToWeek={handleApplyRowToWeek}
          onToggleHoliday={handleToggleHoliday}
        />
      </div>

      <div className="cardapio-page__mobile">
        <CardapioDayCards days={displayDays.filter((day) => day.published || canEdit)} />
      </div>

      <CardapioSendEmailModal
        open={emailOpen}
        weekStart={weekStart}
        defaultRecipients={editorSettings.emailRecipients}
        sending={sendEmailMutation.isPending}
        onClose={() => setEmailOpen(false)}
        onSend={handleSendEmail}
      />
    </main>
  );
}
