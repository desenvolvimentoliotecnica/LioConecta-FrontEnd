import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ACTIVITY_FILTERS,
  activitySummary,
  computePercentFromTasks,
  createActivityDraft,
  filterActivities,
  formatTimeRange,
  groupActivitiesByDate,
  loadActivities,
  newId,
  saveActivities,
  type Activity,
  type ActivityFilter,
  type ActivityTask,
} from "../../config/activities";
import "../../styles/activities-page.css";

type FormState = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  percentComplete: number;
  tasks: ActivityTask[];
};

function toFormState(activity: Activity): FormState {
  return {
    title: activity.title,
    description: activity.description,
    startDate: activity.startDate,
    endDate: activity.endDate,
    percentComplete: activity.percentComplete,
    tasks: activity.tasks.map((task) => ({ ...task })),
  };
}

function ActivityFormModal({
  draft,
  onClose,
  onSave,
}: {
  draft: Activity;
  onClose: () => void;
  onSave: (activity: Activity) => void;
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(draft));
  const [taskInput, setTaskInput] = useState("");
  const [error, setError] = useState<string | null>(null);

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
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("A data de fim deve ser igual ou posterior ao início.");
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
      tasks: form.tasks,
      percentComplete: percent,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="activities-page__modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="activities-page__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="activities-page__modal-header">
          <h2 id="activity-form-title">
            {draft.title ? "Editar atividade" : "Registrar atividade"}
          </h2>
          <button type="button" className="activities-page__modal-close" onClick={onClose} aria-label="Fechar">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <form className="activities-page__form" onSubmit={handleSubmit}>
          <label className="activities-page__field">
            <span>Título</span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ex.: Revisão de documentos"
              required
            />
          </label>

          <label className="activities-page__field">
            <span>Descrição</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Detalhes, contexto ou observações sobre a atividade"
            />
          </label>

          <div className="activities-page__field-row">
            <label className="activities-page__field">
              <span>Início</span>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
                required
              />
            </label>
            <label className="activities-page__field">
              <span>Fim</span>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
                required
              />
            </label>
          </div>

          <div className="activities-page__field">
            <div className="activities-page__field-label-row">
              <span>Percentual concluído</span>
              <strong>{form.percentComplete}%</strong>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={form.percentComplete}
              disabled={form.tasks.length > 0}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, percentComplete: Number(event.target.value) }))
              }
            />
            {form.tasks.length > 0 ? (
              <p className="activities-page__field-hint">
                Calculado automaticamente a partir da checklist ({computePercentFromTasks(form.tasks)}%).
              </p>
            ) : null}
          </div>

          <div className="activities-page__field">
            <span>Checklist</span>
            <ul className="activities-page__form-tasks">
              {form.tasks.map((task) => (
                <li key={task.id}>
                  <span>{task.text}</span>
                  <button type="button" onClick={() => removeTask(task.id)} aria-label="Remover item">
                    <i className="fa-solid fa-trash-can" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="activities-page__task-add">
              <input
                type="text"
                value={taskInput}
                onChange={(event) => setTaskInput(event.target.value)}
                placeholder="Novo item da checklist"
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

          <footer className="activities-page__form-actions">
            <button type="button" className="activities-page__btn activities-page__btn--ghost" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="activities-page__btn activities-page__btn--primary">
              Salvar atividade
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>(() => loadActivities());
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Activity | null>(null);

  useEffect(() => {
    saveActivities(activities);
  }, [activities]);

  const filtered = useMemo(
    () => filterActivities(activities, filter, query),
    [activities, filter, query],
  );

  const groups = useMemo(() => groupActivitiesByDate(filtered), [filtered]);
  const summary = useMemo(() => activitySummary(activities), [activities]);

  const openCreate = () => setEditing(createActivityDraft());

  const saveActivity = (activity: Activity) => {
    setActivities((prev) => {
      const exists = prev.some((item) => item.id === activity.id);
      if (exists) return prev.map((item) => (item.id === activity.id ? activity : item));
      return [activity, ...prev];
    });
    setEditing(null);
  };

  const deleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleTask = (activityId: string, taskId: string) => {
    setActivities((prev) =>
      prev.map((activity) => {
        if (activity.id !== activityId) return activity;
        const tasks = activity.tasks.map((task) =>
          task.id === taskId ? { ...task, done: !task.done } : task,
        );
        return {
          ...activity,
          tasks,
          percentComplete:
            tasks.length > 0 ? computePercentFromTasks(tasks) : activity.percentComplete,
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  };

  return (
    <main className="main">
      <header className="page-header">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Início</Link>
          <span className="breadcrumb__sep">/</span>
          <span className="breadcrumb__current">Minhas atividades</span>
        </nav>
        <div className="page-header__row">
          <div>
            <h1 className="page-header__title">Minhas atividades</h1>
            <p className="page-header__desc">
              Diário pessoal de atividades — registre o que fez, acompanhe checklists e o percentual
              concluído de cada entrega.
            </p>
          </div>
          <button type="button" className="activities-page__new-btn" onClick={openCreate}>
            <i className="fa-solid fa-plus" aria-hidden="true" /> Nova atividade
          </button>
        </div>
      </header>

      <section className="activities-page__controls" aria-label="Resumo e filtros">
        <div className="activities-page__summary">
          <div className="activities-page__summary-icon" aria-hidden="true">
            <i className="fa-solid fa-book-open" />
          </div>
          <div>
            <div className="activities-page__summary-title">Seu diário de trabalho</div>
            <p className="activities-page__summary-text">
              {summary.total} atividades registradas · {summary.open} em andamento · média de{" "}
              {summary.avg}% concluído · {summary.tasksDone}/{summary.tasksTotal} itens de checklist
              feitos
            </p>
          </div>
        </div>

        <div className="activities-page__toolbar">
          <div className="activities-page__filters">
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
          <label className="page-search activities-page__search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por título, descrição ou checklist"
              aria-label="Buscar atividades"
            />
          </label>
        </div>
      </section>

      <div className="activities-page__layout">
        <section className="activities-page__diary" aria-label="Diário de atividades">
          {groups.length === 0 ? (
            <div className="activities-page__empty">
              <i className="fa-regular fa-calendar-check" aria-hidden="true" />
              <p>Nenhuma atividade encontrada para os filtros selecionados.</p>
              <button type="button" className="activities-page__btn activities-page__btn--primary" onClick={openCreate}>
                Registrar primeira atividade
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <article key={group.dateKey} className="activities-page__day">
                <header className="activities-page__day-header">
                  <h2>{group.label}</h2>
                  <span>{group.activities.length} atividade(s)</span>
                </header>

                <div className="activities-page__timeline">
                  {group.activities.map((activity) => (
                    <div key={activity.id} className="activities-page__entry">
                      <div className="activities-page__entry-time">
                        {formatTimeRange(activity.startDate, activity.endDate)}
                      </div>
                      <div className="activities-page__entry-card">
                        <div className="activities-page__entry-head">
                          <h3>{activity.title}</h3>
                          <div className="activities-page__entry-actions">
                            <button
                              type="button"
                              aria-label="Editar atividade"
                              onClick={() => setEditing(activity)}
                            >
                              <i className="fa-solid fa-pen" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              aria-label="Excluir atividade"
                              onClick={() => deleteActivity(activity.id)}
                            >
                              <i className="fa-solid fa-trash-can" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        {activity.description ? (
                          <p className="activities-page__entry-desc">{activity.description}</p>
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
                                    onChange={() => toggleTask(activity.id, task.id)}
                                  />
                                  <span className={task.done ? "is-done" : undefined}>{task.text}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>

        <aside className="activities-page__aside" aria-label="Dicas">
          <div className="activities-page__aside-card">
            <h3>Como usar o diário</h3>
            <ul>
              <li>Registre atividades com início, fim e descrição detalhada.</li>
              <li>Adicione uma checklist — o percentual é calculado automaticamente.</li>
              <li>Marque itens concluídos diretamente no diário para atualizar o progresso.</li>
              <li>Use os filtros para revisar o dia, a semana ou pendências abertas.</li>
            </ul>
          </div>
          <div className="activities-page__aside-card activities-page__aside-card--accent">
            <h3>Em andamento</h3>
            <p>
              {summary.open === 0
                ? "Todas as atividades estão concluídas. Parabéns!"
                : `${summary.open} atividade(s) ainda não atingiram 100%.`}
            </p>
          </div>
        </aside>
      </div>

      {editing ? (
        <ActivityFormModal draft={editing} onClose={() => setEditing(null)} onSave={saveActivity} />
      ) : null}
    </main>
  );
}
