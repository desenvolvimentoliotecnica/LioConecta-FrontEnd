import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useAddUniLioModule,
  useCreateUniLioCourse,
  useSubmitUniLioCourse,
  useUniLioAuthoringCourse,
  useUpdateUniLioCourse,
  type UniLioUpsertCourseRequest,
} from "../../../api/hooks/useUniLioAuthoring";
import { UniLioFallbackBanner } from "../UniLioFallbackBanner";
import "../../../styles/unilio-aprovacao.css";

const EMPTY_COURSE: UniLioUpsertCourseRequest = {
  title: "",
  description: "",
  contentType: "article",
  durationMinutes: 30,
  isMandatory: false,
  area: "Geral",
  department: "Geral",
  instructorName: "",
  tags: [],
};

export function UniLioCourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const isNew = courseId === "novo";
  const navigate = useNavigate();
  const { data: existing, isLoading } = useUniLioAuthoringCourse(isNew ? undefined : courseId);
  const createCourse = useCreateUniLioCourse();
  const updateCourse = useUpdateUniLioCourse(courseId ?? "");
  const submitCourse = useSubmitUniLioCourse();
  const addModule = useAddUniLioModule(courseId ?? "");

  const [form, setForm] = useState<UniLioUpsertCourseRequest>(EMPTY_COURSE);
  const [initialized, setInitialized] = useState(isNew);

  useEffect(() => {
    if (!isNew && existing && !initialized) {
      setForm({
        title: existing.title,
        description: existing.description,
        contentType: existing.contentType,
        durationMinutes: existing.durationMinutes,
        isMandatory: existing.isMandatory,
        area: existing.area,
        department: existing.department,
        instructorName: existing.instructorName,
        thumbnailUrl: existing.thumbnailUrl,
        externalUrl: existing.externalUrl,
        provider: existing.provider,
        visibilityJson: existing.visibilityJson,
        tags: existing.tags,
      });
      setInitialized(true);
    }
  }, [existing, initialized, isNew]);

  if (!isNew && isLoading) {
    return (
      <main className="unilio-page">
        <p className="unilio-page__loading">Carregando curso…</p>
      </main>
    );
  }

  async function handleSave() {
    if (isNew) {
      const created = await createCourse.mutateAsync(form);
      navigate(`/unilio/instrutor/curso/${String((created as { id: string }).id)}/editar`, { replace: true });
      return;
    }
    await updateCourse.mutateAsync(form);
  }

  async function handleSubmit() {
    if (!courseId || isNew) return;
    await handleSave();
    await submitCourse.mutateAsync(courseId);
    navigate("/unilio/instrutor");
  }

  async function handleAddModule() {
    if (!courseId || isNew) return;
    const nextOrder = (existing?.modules.length ?? 0) + 1;
    await addModule.mutateAsync({
      sortOrder: nextOrder,
      title: `Módulo ${nextOrder}`,
      contentType: "article",
      durationMinutes: 15,
      articleHtml: "<p>Conteúdo do módulo.</p>",
    });
  }

  const canEdit = isNew || existing?.status === "draft" || existing?.status === "rejected";

  return (
    <main className="unilio-page">
      <div className="unilio-page__head">
        <Link to="/unilio/instrutor" className="unilio-aprovacao-review__back">
          ← Painel do instrutor
        </Link>
        <h1 className="unilio-page__title">{isNew ? "Novo curso" : "Editar curso"}</h1>
        {!isNew && existing ? (
          <p className="unilio-page__desc">Status: {existing.status}</p>
        ) : null}
      </div>

      <UniLioFallbackBanner show={false} />

      <form
        className="unilio-authoring-form"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSave();
        }}
      >
        <label>
          Título
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            disabled={!canEdit}
            required
          />
        </label>
        <label>
          Descrição
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            disabled={!canEdit}
            rows={4}
          />
        </label>
        <div className="unilio-authoring-form__row">
          <label>
            Área
            <input
              value={form.area}
              onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
              disabled={!canEdit}
            />
          </label>
          <label>
            Duração (min)
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
              disabled={!canEdit}
            />
          </label>
        </div>
        <label className="unilio-authoring-form__check">
          <input
            type="checkbox"
            checked={form.isMandatory}
            onChange={(e) => setForm((f) => ({ ...f, isMandatory: e.target.checked }))}
            disabled={!canEdit}
          />
          Curso obrigatório
        </label>

        <div className="unilio-authoring-form__actions">
          <button type="submit" className="unilio-shell__reset" disabled={!canEdit || createCourse.isPending || updateCourse.isPending}>
            Salvar rascunho
          </button>
          {!isNew && canEdit ? (
            <button
              type="button"
              className="unilio-player__complete-btn"
              onClick={() => void handleSubmit()}
              disabled={submitCourse.isPending}
            >
              Enviar para aprovação
            </button>
          ) : null}
        </div>
      </form>

      {!isNew && existing ? (
        <section className="unilio-authoring-modules">
          <div className="unilio-authoring-modules__head">
            <h2>Módulos ({existing.modules.length})</h2>
            {canEdit ? (
              <button type="button" className="unilio-shell__reset" onClick={() => void handleAddModule()}>
                Adicionar módulo
              </button>
            ) : null}
          </div>
          <ul>
            {existing.modules.map((m) => (
              <li key={m.id}>
                {m.sortOrder}. {m.title} — {m.contentType} — {m.durationMinutes} min
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
