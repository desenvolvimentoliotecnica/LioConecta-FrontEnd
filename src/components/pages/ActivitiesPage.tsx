import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  useCreatePlannerTask,
  useDeletePlannerTask,
  usePlannerBuckets,
  usePlannerTasks,
  useUpdatePlannerTask,
} from "../../api/hooks/usePlannerTasks";
import type { PlannerBucketDto } from "../../api/types";
import {
  ACTIVITY_FILTERS,
  activitySummary,
  activityToPlannerRequest,
  computePercentFromTasks,
  createActivityDraft,
  filterActivities,
  formatTimeRangeWithDuration,
  groupActivitiesByDate,
  newId,
  parseActivityDate,
  plannerTaskToActivity,
  sumCompletedDurationLabel,
  type Activity,
  type ActivityFilter,
  type ActivityTask,
} from "../../config/activities";
import { SectionPageHead, sectionMainClass } from "../layout/SectionPageHead";
import "../../styles/activities-page.css";

const ACTIVITIES_PAGE_SIZE = 12;

const GITHUB_URL_RE = /https?:\/\/(?:www\.)?github\.com\/[^\s<>"'\)\]]+/gi;

function githubLinkLabel(url: string): string {
  if (/\/commit\//i.test(url)) return "Ver no GitHub";
  if (/\/pull\//i.test(url) || /\/pulls\//i.test(url)) return "Ver pull request";
  if (/\/issues\//i.test(url)) return "Ver issue";
  return "Abrir no GitHub";
}

function splitGithubUrl(raw: string): { url: string; trailing: string } {
  const url = raw.replace(/[.,;:!?)\]\}]+$/g, "");
  return { url, trailing: raw.slice(url.length) };
}

function ActivityDescription({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const re = new RegExp(GITHUB_URL_RE.source, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const { url, trailing } = splitGithubUrl(match[0]);
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <a
        key={`gh-${key++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="activities-page__gh-link"
      >
        <i className="fa-brands fa-github" aria-hidden="true" />
        {githubLinkLabel(url)}
      </a>,
    );
    if (trailing) nodes.push(trailing);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <div className="activities-page__entry-desc">{nodes}</div>;
}

function sliceGroupsByActivityCount(
  groups: ReturnType<typeof groupActivitiesByDate>,
  visibleCount: number,
) {
  let remaining = visibleCount;
  const visible: typeof groups = [];

  for (const group of groups) {
    if (remaining <= 0) break;
    const activities = group.activities.slice(0, remaining);
    remaining -= activities.length;
    visible.push({ ...group, activities });
  }

  return visible;
}

type FormState = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  percentComplete: number;
  bucketId: string;
  tasks: ActivityTask[];
};

function toFormState(activity: Activity): FormState {
  return {
    title: activity.title,
    description: activity.description,
    startDate: activity.startDate,
    endDate: activity.endDate,
    percentComplete: activity.percentComplete,
    bucketId: activity.bucketId ?? "",
    tasks: activity.tasks.map((task) => ({ ...task })),
  };
}

function ActivityFormModal({
  draft,
  buckets,
  isSaving,
  onClose,
  onSave,
}: {
  draft: Activity;
  buckets: PlannerBucketDto[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(draft));
  const [taskInput, setTaskInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const isNew = draft.id.startsWith("act-");

  const addTask = () => {
    const text = taskInput.trim();
    if (!text) return;
    setForm((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: newId("task"), text, done: false }],
    }));
    setTaskInput("");
  };

  const removeTask = (taskId: string) => {
    setForm((prev) => ({ ...prev, tasks: prev.tasks.filter((task) => task.id !== taskId) }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Informe um título para a atividade.");
      return;
    }
    const start = parseActivityDate(form.startDate);
    const end = parseActivityDate(form.endDate);
    if (start && end && end < start) {
      setError("A data de fim deve ser igual ou posterior ao início.");
      return;
    }
    if (!form.bucketId && buckets.length > 0) {
      setError("Selecione a coluna do Planner.");
      return;
    }

    const percent =
      form.tasks.length > 0 ? computePercentFromTasks(form.tasks) : form.percentComplete;

    onSave({
      ...draft,
      title: form.title.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      percentComplete: percent,
      bucketId: form.bucketId || buckets[0]?.id,
      tasks: form.tasks,
      updatedAt: new Date().toISOString(),
    });
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="activities-page__modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="activities-page__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="activities-page__modal-header">
          <h2 id="activity-form-title">{isNew ? "Nova atividade" : "Editar atividade"}</h2>
          <button type="button" className="activities-page__modal-close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <form className="activities-page__modal-form" onSubmit={handleSubmit}>
          <div className="activities-page__modal-body">
            <label className="activities-page__field">
              <span>Título</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                required
              />
            </label>

            <label className="activities-page__field">
              <span>Descrição</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={2}
              />
            </label>

            {buckets.length > 0 ? (
              <label className="activities-page__field">
                <span>Coluna (Planner)</span>
                <select
                  value={form.bucketId}
                  onChange={(event) => setForm((prev) => ({ ...prev, bucketId: event.target.value }))}
                >
                  <option value="">Selecione…</option>
                  {buckets.map((bucket) => (
                    <option key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="activities-page__field-row">
              <label className="activities-page__field">
                <span>Início</span>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                />
              </label>
              <label className="activities-page__field">
                <span>Fim / prazo</span>
                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                />
              </label>
            </div>

            <label className="activities-page__field">
              <span>Progresso ({form.tasks.length > 0 ? "calculado pela checklist" : "manual"})</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={form.tasks.length > 0 ? computePercentFromTasks(form.tasks) : form.percentComplete}
                disabled={form.tasks.length > 0}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, percentComplete: Number(event.target.value) }))
                }
              />
            </label>

            <div className="activities-page__field">
              <span>Checklist</span>
              <ul className="activities-page__form-tasks">
                {form.tasks.map((task) => (
                  <li key={task.id}>
                    <span>{task.text}</span>
                    <button type="button" onClick={() => removeTask(task.id)} aria-label="Remover item">
                      <i className="fa-solid fa-xmark" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="activities-page__task-add">
                <input
                  type="text"
                  value={taskInput}
                  placeholder="Novo item da checklist"
                  onChange={(event) => setTaskInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTask();
                    }
                  }}
                />
                <button type="button" onClick={addTask}>
                  <i className="fa-solid fa-plus" aria-hidden="true" /> Adicionar
                </button>
              </div>
            </div>

            {error ? <p className="activities-page__form-error">{error}</p> : null}
          </div>

          <footer className="activities-page__modal-footer">
            <button type="button" className="activities-page__btn activities-page__btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="activities-page__btn activities-page__btn--primary"
              disabled={isSaving}
            >
              {isSaving ? "Salvando…" : "Salvar atividade"}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export function ActivitiesPage() {
  const { data, isLoading, isError, error } = usePlannerTasks();
  const { data: buckets = [] } = usePlannerBuckets(Boolean(data?.plannerEnabled));
  const createTask = useCreatePlannerTask();
  const updateTask = useUpdatePlannerTask();
  const deleteTask = useDeletePlannerTask();

  const [filter, setFilter] = useState<ActivityFilter>("mine");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Activity | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ACTIVITIES_PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const activities = useMemo(
    () => (data?.tasks ?? []).map(plannerTaskToActivity),
    [data?.tasks],
  );

  const filtered = useMemo(
    () => filterActivities(activities, filter, query),
    [activities, filter, query],
  );

  const groups = useMemo(() => groupActivitiesByDate(filtered), [filtered]);
  const summary = useMemo(() => activitySummary(activities), [activities]);
  const visibleGroups = useMemo(
    () => sliceGroupsByActivityCount(groups, visibleCount),
    [groups, visibleCount],
  );
  const hasMore = filtered.length > visibleCount;

  useEffect(() => {
    setVisibleCount(ACTIVITIES_PAGE_SIZE);
  }, [filter, query]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((count) => count + ACTIVITIES_PAGE_SIZE);
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, visibleCount, visibleGroups.length]);

  const defaultBucketId = buckets[0]?.id;
  const isSaving = createTask.isPending || updateTask.isPending || deleteTask.isPending;

  const openCreate = () => {
    setActionError(null);
    setEditing(createActivityDraft(new Date(), defaultBucketId));
  };

  const saveActivity = async (activity: Activity) => {
    setActionError(null);
    const payload = activityToPlannerRequest(activity);
    const isNew = activity.id.startsWith("act-");

    try {
      if (isNew) {
        await createTask.mutateAsync(payload);
      } else {
        await updateTask.mutateAsync({ taskId: activity.id, body: payload });
      }
      setEditing(null);
    } catch {
      setActionError("Não foi possível salvar a atividade no Planner.");
    }
  };

  const deleteActivity = async (activity: Activity) => {
    if (!activity.canEdit) return;
    setActionError(null);
    try {
      await deleteTask.mutateAsync(activity.id);
    } catch {
      setActionError("Não foi possível excluir a atividade.");
    }
  };

  const toggleTask = async (activity: Activity, taskId: string) => {
    if (!activity.canEdit) return;
    setActionError(null);

    const tasks = activity.tasks.map((task) =>
      task.id === taskId ? { ...task, done: !task.done } : task,
    );
    const body = activityToPlannerRequest({
      ...activity,
      tasks,
      percentComplete:
        tasks.length > 0 ? computePercentFromTasks(tasks) : activity.percentComplete,
    });

    try {
      await updateTask.mutateAsync({ taskId: activity.id, body });
    } catch {
      setActionError("Não foi possível atualizar a checklist.");
    }
  };

  const planTitle = data?.planTitle?.trim();

  return (
    <main className={sectionMainClass("atividades")}>
      <SectionPageHead
        section="atividades"
        title="Minhas atividades"
        description={`Tarefas do plano ${planTitle ? `«${planTitle}»` : "Microsoft Planner"} — acompanhe entregas da equipe e gerencie as atividades atribuídas a você.`}
        syncMeta={
          !isLoading && data?.plannerEnabled
            ? `${summary.total} tarefas · ${summary.open} em andamento · média de ${summary.avg}% concluído · ${summary.tasksDone}/${summary.tasksTotal} itens de checklist`
            : null
        }
        actions={
          <button
            type="button"
            className="activities-page__new-btn"
            onClick={openCreate}
            disabled={!data?.plannerEnabled || isSaving}
          >
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nova atividade
          </button>
        }
        toolbar={
          <div className="pay-toolbar" aria-label="Filtros de atividades">
            <div className="pay-toolbar__filters page-filters" role="group" aria-label="Filtros">
              {ACTIVITY_FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`filter-chip${filter === item.id ? " is-active" : ""}`}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pay-toolbar__actions">
              <label className="pay-search page-search">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  className="page-search__input"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por título, responsável ou checklist"
                  aria-label="Buscar atividades"
                />
              </label>
            </div>
          </div>
        }
      />

      {!data?.plannerEnabled && !isLoading ? (
        <div className="activities-page__banner activities-page__banner--info" role="status">
          Integração Planner desabilitada. Um administrador pode ativar em{" "}
          <Link to="/admin/configuracoes-backend?category=planner">Configurações do Backend → Planner</Link>.
        </div>
      ) : null}

      {actionError ? (
        <div className="activities-page__banner activities-page__banner--error" role="alert">
          {actionError}
        </div>
      ) : null}

      <div className="activities-page__layout">
        <section className="activities-page__diary" aria-label="Diário de atividades">
          {isLoading ? (
            <p className="page-empty-note">Carregando tarefas do Planner…</p>
          ) : isError ? (
            <div className="activities-page__empty">
              <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
              <p>Não foi possível carregar as tarefas.</p>
              <p className="activities-page__empty-detail">
                {error instanceof Error ? error.message : "Verifique se a API está online."}
              </p>
            </div>
          ) : groups.length === 0 ? (
            <div className="activities-page__empty">
              <i className="fa-regular fa-calendar-check" aria-hidden="true" />
              <p>Nenhuma tarefa encontrada para os filtros selecionados.</p>
              {data?.plannerEnabled ? (
                <button
                  type="button"
                  className="activities-page__btn activities-page__btn--primary"
                  onClick={openCreate}
                >
                  Criar primeira tarefa
                </button>
              ) : null}
            </div>
          ) : (
            <>
              {visibleGroups.map((group) => {
                const fullGroup = groups.find((item) => item.dateKey === group.dateKey) ?? group;
                const daySlices = fullGroup.activities;
                const dayTotal = daySlices.length;
                const dayHours = sumCompletedDurationLabel(
                  daySlices.map((slice) => slice.activity),
                  group.dateKey,
                );
                return (
                  <article key={group.dateKey} className="activities-page__day">
                    <header className="activities-page__day-header">
                      <h2>{group.label}</h2>
                      <span className="activities-page__day-stats">
                        {dayTotal} tarefa(s)
                        {dayHours ? ` · ${dayHours}` : ""}
                      </span>
                    </header>

                    <div className="activities-page__timeline">
                      {group.activities.map((slice) => {
                        const activity = slice.activity;
                        const { range, duration } = formatTimeRangeWithDuration(
                          slice.sliceStart,
                          slice.sliceEnd,
                          { applyMinimum: false },
                        );
                        return (
                          <div
                            key={`${activity.id}-${group.dateKey}`}
                            className={`activities-page__entry${activity.canEdit ? "" : " is-readonly"}`}
                          >
                            <div className="activities-page__entry-time">
                              <span className="activities-page__entry-time-range">{range}</span>
                              {duration ? (
                                <span className="activities-page__entry-time-duration">{duration}</span>
                              ) : null}
                            </div>
                            <div className="activities-page__entry-card">
                              <div className="activities-page__entry-head">
                                <div>
                                  <h3>{activity.title}</h3>
                                  <div className="activities-page__entry-meta">
                                    {activity.bucketName ? (
                                      <span className="activities-page__bucket">{activity.bucketName}</span>
                                    ) : null}
                                    {activity.assignees && activity.assignees.length > 0 ? (
                                      <span className="activities-page__assignees">
                                        {activity.assignees.map((assignee) => assignee.name).join(", ")}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="activities-page__entry-actions">
                                  {activity.plannerUrl ? (
                                    <a
                                      href={activity.plannerUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label="Abrir no Planner"
                                      className="activities-page__planner-link"
                                    >
                                      <i className="fa-brands fa-microsoft" aria-hidden="true" />
                                    </a>
                                  ) : null}
                                  <button
                                    type="button"
                                    aria-label="Editar atividade"
                                    disabled={!activity.canEdit || isSaving}
                                    onClick={() => setEditing(activity)}
                                  >
                                    <i className="fa-solid fa-pen" aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label="Excluir atividade"
                                    disabled={!activity.canEdit || isSaving}
                                    onClick={() => void deleteActivity(activity)}
                                  >
                                    <i className="fa-solid fa-trash-can" aria-hidden="true" />
                                  </button>
                                </div>
                              </div>

                              {activity.description ? (
                                <ActivityDescription text={activity.description} />
                              ) : null}

                              <div className="activities-page__progress">
                                <div className="activities-page__progress-bar">
                                  <span style={{ width: `${activity.percentComplete}%` }} />
                                </div>
                                <strong>{activity.percentComplete}%</strong>
                              </div>

                              {activity.tasks.length > 0 ? (
                                <ul className="activities-page__tasks">
                                  {activity.tasks.map((task) => (
                                    <li key={task.id}>
                                      <label>
                                        <input
                                          type="checkbox"
                                          checked={task.done}
                                          disabled={!activity.canEdit || isSaving}
                                          onChange={() => void toggleTask(activity, task.id)}
                                        />
                                        <span className={task.done ? "is-done" : undefined}>{task.text}</span>
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}

              {hasMore ? (
                <div
                  ref={loadMoreRef}
                  className="activities-page__load-more"
                  aria-live="polite"
                >
                  <span className="activities-page__load-more-spinner" aria-hidden="true" />
                  Carregando mais atividades…
                </div>
              ) : filtered.length > ACTIVITIES_PAGE_SIZE ? (
                <p className="activities-page__end-note">
                  Todas as {filtered.length} atividades foram carregadas.
                </p>
              ) : null}
            </>
          )}
        </section>

        <aside className="activities-page__aside" aria-label="Dicas">
          <div className="activities-page__aside-card">
            <h3>Integração Planner</h3>
            <ul>
              <li>Todas as tarefas do plano da equipe aparecem aqui.</li>
              <li>Você só pode editar ou excluir tarefas atribuídas a você.</li>
              <li>Novas atividades são criadas no Planner e ficam sob sua responsabilidade.</li>
              <li>Use o ícone Microsoft para abrir a tarefa no board web.</li>
            </ul>
          </div>
          <div className="activities-page__aside-card activities-page__aside-card--accent">
            <h3>Em andamento</h3>
            <p>
              {summary.open === 0
                ? "Todas as tarefas visíveis estão concluídas."
                : `${summary.open} tarefa(s) ainda não atingiram 100%.`}
            </p>
          </div>
        </aside>
      </div>

      {editing ? (
        <ActivityFormModal
          draft={editing}
          buckets={buckets}
          isSaving={isSaving}
          onClose={() => setEditing(null)}
          onSave={(activity) => void saveActivity(activity)}
        />
      ) : null}
    </main>
  );
}
