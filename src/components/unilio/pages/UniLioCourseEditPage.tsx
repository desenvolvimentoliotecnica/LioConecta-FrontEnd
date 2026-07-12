import { useEffect, useMemo, useRef, useState } from "react";

import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  useAddUniLioModule,
  useCreateUniLioCourse,
  useDeleteUniLioCourseAssessment,
  useDeleteUniLioModule,
  useSubmitUniLioCourse,
  useUniLioAuthoringCourse,
  useUpdateUniLioCourse,
  useUpdateUniLioModule,
  useUpsertUniLioCourseAssessment,
  useWithdrawUniLioCourse,
  useUploadUniLioScormPackage,
  type UniLioUpsertAssessmentRequest,
  type UniLioUpsertCourseRequest,
  type UniLioUpsertModuleRequest,
} from "../../../api/hooks/useUniLioAuthoring";

import { useUniLioMeta } from "../../../api/hooks/useUniLioMeta";

import { CONTENT_TYPE_LABELS, MODULE_CONTENT_TYPE_OPTIONS } from "../../../config/unilio/constants";

import type { UniLioContentType } from "../../../config/unilio/types";

import { UniLioFallbackBanner } from "../UniLioFallbackBanner";

import { UniLioContentTypeBadge } from "../UniLioShared";

import { UniLioCourseStatusChip } from "../UniLioCourseStatusChip";
import { UniLioModuleEditModal } from "../UniLioModuleEditModal";
import { UniLioAssessmentEditModal } from "../UniLioAssessmentEditModal";
import { ComunicadoHeroImagePicker } from "../../comunicados/ComunicadoHeroImagePicker";
import { parseAssessmentQuestionsJson } from "../../../utils/unilioAssessment";
import {
  defaultQuestionnaireDraft,
  serializeQuestionnaireDraft,
} from "../../../utils/unilioQuestionnaire";
import {
  formatUniLioAttachmentSize,
} from "../../../utils/unilioAttachments";
import {
  UNILIO_SCORM_ACCEPT,
  UNILIO_SCORM_MAX_BYTES,
} from "../../../utils/unilioAttachments";

import "../../../styles/unilio-aprovacao.css";
import "../../../styles/comunicado-hero-image-modal.css";

import "../../../styles/unilio-instrutor-page.css";

import "../../../styles/unilio-questions.css";
import "../../../styles/unilio-scorm.css";

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

const AUTHORING_STEPS = [
  "Defina título, descrição e classificação do curso.",

  "Salve como rascunho para liberar a edição de módulos.",

  "Monte os módulos e clique em cada um para editar o conteúdo (artigo, vídeo, link ou questionário).",

  "Configure a avaliação final do curso, se necessário.",

  "Envie para aprovação quando estiver pronto para publicação.",
];

const AUTHORING_STEPS_SCORM = [
  "Defina título, descrição e classificação do curso.",

  "Salve como rascunho para liberar o envio do pacote SCORM.",

  "Faça upload do arquivo .zip SCORM gerado pela sua ferramenta de autoria.",

  "Defina a nota mínima de aprovação (se aplicável).",

  "Envie para aprovação quando estiver pronto para publicação.",
];

export function UniLioCourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>();

  const isNew = courseId === "novo";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preferScorm =
    searchParams.get("tipo")?.toLowerCase() === "scorm" ||
    searchParams.get("type")?.toLowerCase() === "scorm";

  const { data: meta } = useUniLioMeta();

  const { data: existing, isLoading } = useUniLioAuthoringCourse(
    isNew ? undefined : courseId,
  );

  const createCourse = useCreateUniLioCourse();

  const updateCourse = useUpdateUniLioCourse(courseId ?? "");

  const submitCourse = useSubmitUniLioCourse();

  const withdrawCourse = useWithdrawUniLioCourse();

  const addModule = useAddUniLioModule(courseId ?? "");
  const updateModule = useUpdateUniLioModule(courseId ?? "");
  const deleteModule = useDeleteUniLioModule(courseId ?? "");
  const upsertAssessment = useUpsertUniLioCourseAssessment(courseId ?? "");
  const deleteAssessment = useDeleteUniLioCourseAssessment(courseId ?? "");
  const uploadScorm = useUploadUniLioScormPackage(courseId ?? "");

  const [form, setForm] = useState<UniLioUpsertCourseRequest>(() =>
    preferScorm ? { ...EMPTY_COURSE, contentType: "scorm" } : EMPTY_COURSE,
  );
  const [initialized, setInitialized] = useState(isNew);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [newModuleType, setNewModuleType] = useState("article");
  const [scormPassingScore, setScormPassingScore] = useState<number>(70);
  const [scormUploadStatus, setScormUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [scormUploadError, setScormUploadError] = useState<string | null>(null);
  const scormFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew || !preferScorm) return;
    setForm((f) => (f.contentType === "scorm" ? f : { ...f, contentType: "scorm" }));
  }, [isNew, preferScorm]);

  const areaOptions = useMemo(() => {
    const values = new Set(meta.areas);

    if (form.area.trim()) values.add(form.area.trim());

    return Array.from(values);
  }, [form.area, meta.areas]);

  const departmentOptions = useMemo(() => {
    const values = new Set(meta.departments);

    if (form.department.trim()) values.add(form.department.trim());

    return Array.from(values);
  }, [form.department, meta.departments]);

  const contentTypeOptions = useMemo(() => {
    const types = meta.contentTypes.includes("scorm")
      ? meta.contentTypes
      : [...meta.contentTypes, "scorm"];
    return types.map((type) => ({
      value: type,
      label: CONTENT_TYPE_LABELS[type as UniLioContentType] ?? type,
    }));
  }, [meta.contentTypes]);

  const moduleTypeOptions = MODULE_CONTENT_TYPE_OPTIONS;

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

        scormPassingScore: existing.scormPassingScore ?? null,
      });

      if (existing.scormPassingScore != null) {
        setScormPassingScore(existing.scormPassingScore);
      }

      setInitialized(true);
    }
  }, [existing, initialized, isNew]);

  if (!isNew && isLoading) {
    return (
      <main className="unilio-page unilio-page--authoring">
        <p className="unilio-page__loading">Carregando curso…</p>
      </main>
    );
  }

  async function handleSave() {
    const payload = { ...form, scormPassingScore };
    if (isNew) {
      const created = await createCourse.mutateAsync(payload);

      navigate(
        `/unilio/instrutor/curso/${String((created as { id: string }).id)}/editar`,
        { replace: true },
      );

      return;
    }

    await updateCourse.mutateAsync(payload);
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
    const contentType = newModuleType;
    const body: UniLioUpsertModuleRequest = {
      sortOrder: nextOrder,
      title:
        contentType === "quiz"
          ? `Questionário ${nextOrder}`
          : `Módulo ${nextOrder}`,
      contentType,
      durationMinutes: contentType === "quiz" ? 10 : 15,
    };

    if (contentType === "article") {
      body.articleHtml = "<p>Conteúdo do módulo.</p>";
    }

    if (contentType === "quiz") {
      body.quizJson = serializeQuestionnaireDraft(defaultQuestionnaireDraft(70));
    }

    const created = await addModule.mutateAsync(body);

    setSelectedModuleId(String((created as { id: string }).id));
  }

  const selectedModule =
    existing?.modules.find((module) => module.id === selectedModuleId) ?? null;

  async function handleSaveModule(body: UniLioUpsertModuleRequest) {
    if (!selectedModuleId) return;
    await updateModule.mutateAsync({ moduleId: selectedModuleId, body });
    setSelectedModuleId(null);
  }

  async function handleDeleteModule() {
    if (
      !selectedModuleId ||
      !window.confirm("Excluir este módulo? Esta ação não pode ser desfeita.")
    ) {
      return;
    }
    await deleteModule.mutateAsync(selectedModuleId);
    setSelectedModuleId(null);
  }

  async function handleSaveAssessment(body: UniLioUpsertAssessmentRequest) {
    await upsertAssessment.mutateAsync(body);
    setAssessmentModalOpen(false);
  }

  async function handleDeleteAssessment() {
    if (
      !window.confirm(
        "Remover a avaliação final deste curso? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }
    await deleteAssessment.mutateAsync();
    setAssessmentModalOpen(false);
  }

  const assessmentQuestionCount = existing?.assessment
    ? parseAssessmentQuestionsJson(existing.assessment.questionsJson).length
    : 0;

  const isScorm = form.contentType === "scorm" || (!isNew && existing?.contentType === "scorm");

  const canEdit =
    isNew || existing?.status === "draft" || existing?.status === "rejected";

  const isPendingApproval = existing?.status === "pending_approval";

  const isSaving = createCourse.isPending || updateCourse.isPending;

  async function handleScormFileChange(file: File) {
    if (file.size > UNILIO_SCORM_MAX_BYTES) {
      setScormUploadStatus("error");
      setScormUploadError(`Arquivo muito grande. Máximo: ${formatUniLioAttachmentSize(UNILIO_SCORM_MAX_BYTES)}`);
      return;
    }
    setScormUploadStatus("uploading");
    setScormUploadError(null);
    try {
      await uploadScorm.mutateAsync({ file, passingScore: scormPassingScore });
      setScormUploadStatus("success");
    } catch {
      setScormUploadStatus("error");
      setScormUploadError("Falha ao enviar o pacote SCORM. Verifique o arquivo e tente novamente.");
    }
  }

  async function handleWithdraw() {
    if (!courseId || isNew) return;

    await withdrawCourse.mutateAsync(courseId);
  }

  return (
    <main className="unilio-page unilio-page--authoring">
      <div className="unilio-authoring-page-head">
        <Link to="/unilio/instrutor" className="unilio-inbox-back">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
          Voltar ao painel do instrutor
        </Link>

        <div className="unilio-authoring-page-head__title-row">
          <div>
            <h1 className="unilio-page__title">
              {isNew
                ? isScorm
                  ? "Novo curso SCORM"
                  : "Novo curso"
                : "Editar curso"}
            </h1>

            <p className="unilio-page__desc">
              {isNew
                ? isScorm
                  ? "Informe os metadados, salve o rascunho e faça o upload do pacote .zip SCORM 1.2 para enviar à aprovação."
                  : "Cadastre as informações iniciais do curso. Depois de salvar, você poderá adicionar módulos e enviar para aprovação."
                : "Atualize metadados, módulos e envie novamente quando o conteúdo estiver pronto."}
            </p>
          </div>

          {!isNew && existing ? (
            <UniLioCourseStatusChip status={existing.status} />
          ) : null}
        </div>
      </div>

      <UniLioFallbackBanner show={false} />

      {isPendingApproval ? (
        <section className="unilio-authoring-pending-banner">
          <p>
            Este curso está aguardando aprovação. Reverta para rascunho para
            editar o conteúdo e reenviar depois.
          </p>

          <button
            type="button"

            className="unilio-player__complete-btn"

            disabled={withdrawCourse.isPending}

            onClick={() => void handleWithdraw()}
          >
            {withdrawCourse.isPending
              ? "Revertendo…"
              : "Reverter para rascunho"}
          </button>
        </section>
      ) : null}

      {!isNew && existing?.status === "rejected" && existing.rejectionReason ? (
        <section className="unilio-authoring-rejected-banner">
          <i className="fa-solid fa-circle-xmark" aria-hidden="true" />

          <div>
            <strong>Motivo da rejeição</strong>

            <p>{existing.rejectionReason}</p>
          </div>
        </section>
      ) : null}

      <div className="unilio-authoring-layout">
        <form
          className="unilio-authoring-panel"

          onSubmit={(e) => {
            e.preventDefault();

            void handleSave();
          }}
        >
          <section className="unilio-authoring-form__section">
            <header className="unilio-authoring-form__section-head">
              <h2>
                <i className="fa-solid fa-book-open" aria-hidden="true" />
                Informações básicas
              </h2>

              <p>
                Título e descrição exibidos no catálogo e na página do curso.
              </p>
            </header>

            <div className="unilio-authoring-form__grid unilio-authoring-form__grid--1">
              <label className="unilio-authoring-field">
                <span className="unilio-authoring-field__label">Título</span>

                <input
                  className="unilio-authoring-field__control"

                  value={form.title}

                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }

                  disabled={!canEdit}

                  placeholder="Ex.: Introdução à segurança alimentar"

                  required
                />
              </label>

              <label className="unilio-authoring-field">
                <span className="unilio-authoring-field__label">Descrição</span>

                <textarea
                  className="unilio-authoring-field__control unilio-authoring-field__control--textarea"

                  value={form.description}

                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }

                  disabled={!canEdit}

                  rows={4}

                  placeholder="Resuma objetivos, público-alvo e o que o aluno vai aprender."
                />
              </label>

              <div className="unilio-authoring-field unilio-authoring-field--thumbnail">
                <span className="unilio-authoring-field__label">Imagem de capa</span>
                <p className="unilio-authoring-field__help">
                  Miniatura exibida no catálogo e nos cards do curso. Escolha um modelo ou envie um arquivo.
                </p>
                <ComunicadoHeroImagePicker
                  value={form.thumbnailUrl ?? ""}
                  disabled={!canEdit}
                  onChange={(url) =>
                    setForm((f) => ({ ...f, thumbnailUrl: url.trim() || null }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="unilio-authoring-form__section">
            <header className="unilio-authoring-form__section-head">
              <h2>
                <i className="fa-solid fa-tags" aria-hidden="true" />
                Classificação
              </h2>

              <p>
                Área, departamento, formato principal e carga horária estimada.
              </p>
            </header>

            <div className="unilio-authoring-form__grid unilio-authoring-form__grid--2">
              <label className="unilio-authoring-field">
                <span className="unilio-authoring-field__label">Área</span>

                <select
                  className="unilio-authoring-field__control"

                  value={form.area}

                  onChange={(e) =>
                    setForm((f) => ({ ...f, area: e.target.value }))
                  }

                  disabled={!canEdit}
                >
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </label>

              <label className="unilio-authoring-field">
                <span className="unilio-authoring-field__label">
                  Departamento
                </span>

                <select
                  className="unilio-authoring-field__control"

                  value={form.department}

                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }

                  disabled={!canEdit}
                >
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </label>

              <label className="unilio-authoring-field">
                <span className="unilio-authoring-field__label">
                  Formato principal
                </span>

                <select
                  className="unilio-authoring-field__control"

                  value={form.contentType}

                  onChange={(e) =>
                    setForm((f) => ({ ...f, contentType: e.target.value }))
                  }

                  disabled={!canEdit}
                >
                  {contentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="unilio-authoring-field">
                <span className="unilio-authoring-field__label">
                  Duração estimada (min)
                </span>

                <input
                  className="unilio-authoring-field__control"

                  type="number"

                  min={1}

                  step={1}

                  value={form.durationMinutes}

                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      durationMinutes: Number(e.target.value),
                    }))
                  }

                  disabled={!canEdit}
                />
              </label>
            </div>

            <div className="unilio-authoring-form__toggle">
              <div className="unilio-authoring-form__toggle-copy">
                <strong>Curso obrigatório</strong>

                <p>
                  Quando ativo, a conclusão passa a integrar indicadores de
                  compliance da equipe.
                </p>
              </div>

              <label className="unilio-authoring-form__switch">
                <input
                  type="checkbox"

                  checked={form.isMandatory}

                  onChange={(e) =>
                    setForm((f) => ({ ...f, isMandatory: e.target.checked }))
                  }

                  disabled={!canEdit}

                  aria-label="Curso obrigatório"
                />

                <span
                  className="unilio-authoring-form__switch-ui"
                  aria-hidden="true"
                />
              </label>
            </div>
          </section>

          <footer className="unilio-authoring-form__footer">
            <Link
              to="/unilio/instrutor"
              className="unilio-authoring-btn unilio-authoring-btn--ghost"
            >
              Cancelar
            </Link>

            <div className="unilio-authoring-form__footer-actions">
              <button
                type="submit"

                className="unilio-authoring-btn unilio-authoring-btn--secondary"

                disabled={!canEdit || isSaving}
              >
                {isSaving ? "Salvando…" : "Salvar rascunho"}
              </button>

              {!isNew && canEdit ? (
                <button
                  type="button"

                  className="unilio-player__complete-btn"

                  onClick={() => void handleSubmit()}

                  disabled={submitCourse.isPending || isSaving}
                >
                  {submitCourse.isPending
                    ? "Enviando…"
                    : "Enviar para aprovação"}
                </button>
              ) : null}
            </div>
          </footer>
        </form>

        <aside className="unilio-authoring-aside">
          {isNew ? (
            <section className="unilio-authoring-aside__card">
              <h2>Como funciona</h2>

              <ol className="unilio-authoring-steps">
                {(isScorm ? AUTHORING_STEPS_SCORM : AUTHORING_STEPS).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          ) : null}

          {!isNew && existing && isScorm ? (
            <section className="unilio-authoring-aside__card">
              <div className="unilio-authoring-modules__head">
                <div>
                  <h2>Pacote SCORM</h2>
                  <p>Envie o arquivo .zip gerado pela sua ferramenta de autoria.</p>
                </div>
              </div>

              <div className="unilio-scorm-panel">
                <label className="unilio-authoring-field">
                  <span className="unilio-authoring-field__label">Nota mínima de aprovação (%)</span>
                  <input
                    className="unilio-authoring-field__control"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={scormPassingScore}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setScormPassingScore(v);
                      setForm((f) => ({ ...f, scormPassingScore: v }));
                    }}
                  />
                </label>

                {existing.scormPackage ? (
                  <div className="unilio-scorm-panel__package">
                    <i className="fa-solid fa-file-zipper unilio-scorm-panel__package-icon" aria-hidden="true" />
                    <div className="unilio-scorm-panel__package-meta">
                      <div className="unilio-scorm-panel__package-name">
                        {existing.scormPackage.originalFileName}
                      </div>
                      <div className="unilio-scorm-panel__package-detail">
                        {existing.scormPackage.manifestTitle} · {existing.scormPackage.scoCount} SCO{existing.scormPackage.scoCount !== 1 ? "s" : ""} · {formatUniLioAttachmentSize(existing.scormPackage.sizeBytes)}
                      </div>
                    </div>
                  </div>
                ) : null}

                {canEdit ? (
                  <>
                    <input
                      ref={scormFileInputRef}
                      type="file"
                      accept={UNILIO_SCORM_ACCEPT}
                      className="sr-only"
                      aria-label="Selecionar pacote SCORM"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          void handleScormFileChange(file);
                        }
                        e.target.value = "";
                      }}
                    />

                    <button
                      type="button"
                      className="unilio-scorm-dropzone"
                      onClick={() => scormFileInputRef.current?.click()}
                      disabled={uploadScorm.isPending}
                    >
                      <i className="fa-solid fa-cloud-arrow-up unilio-scorm-dropzone__icon" aria-hidden="true" />
                      <span className="unilio-scorm-dropzone__label">
                        {existing.scormPackage ? "Substituir pacote SCORM" : "Selecionar arquivo .zip"}
                      </span>
                      <span className="unilio-scorm-dropzone__hint">
                        Máximo {formatUniLioAttachmentSize(UNILIO_SCORM_MAX_BYTES)}
                      </span>
                    </button>
                  </>
                ) : null}

                {scormUploadStatus === "uploading" ? (
                  <div className="unilio-scorm-upload-status unilio-scorm-upload-status--uploading">
                    <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" />
                    Enviando pacote SCORM…
                  </div>
                ) : null}

                {scormUploadStatus === "success" ? (
                  <div className="unilio-scorm-upload-status unilio-scorm-upload-status--success">
                    <i className="fa-solid fa-circle-check" aria-hidden="true" />
                    Pacote SCORM enviado com sucesso.
                  </div>
                ) : null}

                {scormUploadStatus === "error" && scormUploadError ? (
                  <div className="unilio-scorm-upload-status unilio-scorm-upload-status--error">
                    <i className="fa-solid fa-circle-xmark" aria-hidden="true" />
                    {scormUploadError}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {!isNew && existing && !isScorm ? (
            <section className="unilio-authoring-aside__card unilio-authoring-modules">
              <div className="unilio-authoring-modules__head">
                <div>
                  <h2>Módulos</h2>

                  <p>
                    {existing.modules.length} módulo
                    {existing.modules.length === 1 ? "" : "s"} cadastrado
                    {existing.modules.length === 1 ? "" : "s"}
                  </p>
                </div>

                {canEdit ? (
                  <div className="unilio-authoring-modules__actions">
                    <label className="unilio-authoring-modules__type">
                      <select
                        className="unilio-authoring-field__control"
                        value={newModuleType}
                        onChange={(e) => setNewModuleType(e.target.value)}
                        disabled={addModule.isPending}
                        aria-label="Tipo do novo módulo"
                      >
                        {moduleTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="unilio-authoring-btn unilio-authoring-btn--secondary"
                      onClick={() => void handleAddModule()}
                      disabled={addModule.isPending}
                    >
                      <i className="fa-solid fa-plus" aria-hidden="true" />
                      Adicionar
                    </button>
                  </div>
                ) : null}
              </div>

              {existing.modules.length === 0 ? (
                <p className="unilio-authoring-modules__empty">
                  Nenhum módulo ainda. Adicione o primeiro bloco de conteúdo do
                  curso.
                </p>
              ) : (
                <ul className="unilio-authoring-modules__list">
                  {existing.modules.map((module) => (
                    <li key={module.id}>
                      <button
                        type="button"
                        className="unilio-authoring-modules__item"
                        onClick={() => setSelectedModuleId(module.id)}
                      >
                        <span className="unilio-authoring-modules__order">
                          {module.sortOrder}
                        </span>
                        <div className="unilio-authoring-modules__body">
                          <strong>{module.title}</strong>
                          <span className="unilio-authoring-modules__meta">
                            <UniLioContentTypeBadge type={module.contentType} />
                            <span>{module.durationMinutes} min</span>
                          </span>
                        </div>
                        <span className="unilio-authoring-modules__edit">
                          <i className="fa-solid fa-pen" aria-hidden="true" />
                          Editar conteúdo
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {!isNew && existing && !isScorm ? (
            <section className="unilio-authoring-aside__card unilio-authoring-assessment">
              <div className="unilio-authoring-modules__head">
                <div>
                  <h2>Avaliação final</h2>
                  <p>
                    {existing.assessment
                      ? `${assessmentQuestionCount} questão${assessmentQuestionCount === 1 ? "" : "ões"} · nota mínima ${existing.assessment.passingScore}%`
                      : "Teste final opcional para concluir o curso."}
                  </p>
                </div>
              </div>

              {existing.assessment ? (
                <button
                  type="button"
                  className="unilio-authoring-modules__item unilio-authoring-assessment__item"
                  onClick={() => setAssessmentModalOpen(true)}
                >
                  <div className="unilio-authoring-modules__body">
                    <strong>{existing.assessment.title}</strong>
                    <span className="unilio-authoring-modules__meta">
                      <span className="unilio-type-badge">Avaliação</span>
                      <span>{assessmentQuestionCount} questões</span>
                    </span>
                  </div>
                  <span className="unilio-authoring-modules__edit">
                    <i className="fa-solid fa-pen" aria-hidden="true" />
                    Editar avaliação
                  </span>
                </button>
              ) : (
                <p className="unilio-authoring-modules__empty">
                  Nenhuma avaliação final configurada.
                </p>
              )}

              {canEdit ? (
                <button
                  type="button"
                  className="unilio-authoring-btn unilio-authoring-btn--secondary unilio-authoring-assessment__configure"
                  onClick={() => setAssessmentModalOpen(true)}
                  disabled={upsertAssessment.isPending || deleteAssessment.isPending}
                >
                  <i
                    className={`fa-solid ${existing.assessment ? "fa-pen" : "fa-plus"}`}
                    aria-hidden="true"
                  />
                  {existing.assessment ? "Editar avaliação" : "Configurar avaliação final"}
                </button>
              ) : null}
            </section>
          ) : null}
        </aside>
      </div>

      <UniLioModuleEditModal
        open={Boolean(selectedModule)}
        courseId={courseId ?? ""}
        module={selectedModule}
        canEdit={canEdit}
        busy={updateModule.isPending}
        deleting={deleteModule.isPending}
        onClose={() => setSelectedModuleId(null)}
        onSave={(body) => void handleSaveModule(body)}
        onDelete={canEdit ? () => void handleDeleteModule() : undefined}
      />

      <UniLioAssessmentEditModal
        open={assessmentModalOpen}
        assessment={existing?.assessment ?? null}
        canEdit={canEdit}
        busy={upsertAssessment.isPending}
        deleting={deleteAssessment.isPending}
        onClose={() => setAssessmentModalOpen(false)}
        onSave={(body) => void handleSaveAssessment(body)}
        onDelete={
          canEdit && existing?.assessment
            ? () => void handleDeleteAssessment()
            : undefined
        }
      />
    </main>
  );
}
