import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUniLioCourseRecommendations } from "../../api/hooks/useUniLioCourseRecommendations";
import { useUniLioCourseStart } from "../../api/hooks/useUniLioCourseStart";
import { useUniLioProgress } from "../../api/hooks/useUniLioProgress";
import { formatUniLioDuration } from "../../utils/unilioView";
import { parseUniLioQuizJson } from "../../utils/unilioQuiz";
import type { UniLioCourseDetail, UniLioModule } from "../../config/unilio/types";
import { UniLioContentTypeBadge, UniLioProgressBar } from "./UniLioShared";
import { UniLioQuizWidget } from "./UniLioQuizWidget";
import { UniLioCourseRecommendationsModal } from "./UniLioCourseRecommendationsModal";
import { UniLioCourseFeedbackModal } from "./UniLioCourseFeedbackModal";
import "../../styles/unilio-player.css";

type Props = {
  course: UniLioCourseDetail;
  isFallback?: boolean;
};

function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") && parsed.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (parsed.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    return url;
  } catch {
    return url;
  }
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.startsWith("/videos/");
}

function resolveModuleMedia(module: UniLioModule, course: UniLioCourseDetail) {
  const type = module.contentType;

  if (type === "article" || type === "quiz") {
    return { kind: "empty" as const };
  }

  const rawUrl =
    module.contentUrl ??
    (type === "external" || type === "video" || type === "pdf" ? course.externalUrl : null);

  if (!rawUrl) {
    return { kind: "empty" as const };
  }

  if (type === "pdf") {
    return { kind: "pdf" as const, url: rawUrl };
  }

  if (type === "external" || type === "video") {
    if (isDirectVideo(rawUrl)) {
      return { kind: "video" as const, url: rawUrl };
    }

    const embedUrl = toEmbedUrl(rawUrl);
    if (embedUrl.includes("youtube.com/embed") || embedUrl.includes("player.vimeo")) {
      return { kind: "embed" as const, url: embedUrl };
    }
    return { kind: "link" as const, url: rawUrl, provider: course.provider };
  }

  return { kind: "empty" as const };
}

function stripDuplicateArticleTitle(html: string, title: string): string {
  const normalizedTitle = title.trim().toLowerCase();
  return html.replace(/^\s*<h2[^>]*>([\s\S]*?)<\/h2>/i, (match, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim().toLowerCase();
    return text === normalizedTitle ? "" : match;
  });
}

export function UniLioPlayer({ course, isFallback = false }: Props) {
  const completeMutation = useUniLioProgress();
  useUniLioCourseStart(course.id);
  const contentRef = useRef<HTMLDivElement>(null);
  const orderedModules = useMemo(
    () => [...course.modules].sort((a, b) => a.sortOrder - b.sortOrder),
    [course.modules],
  );
  const [activeModuleId, setActiveModuleId] = useState<string | null>(
    course.modules.find((m) => !m.isCompleted)?.id ?? course.modules[0]?.id ?? null,
  );

  const activeModule = useMemo(
    () => course.modules.find((m) => m.id === activeModuleId) ?? null,
    [course.modules, activeModuleId],
  );

  const media = useMemo(
    () => (activeModule ? resolveModuleMedia(activeModule, course) : null),
    [activeModule, course],
  );

  const quizPayload = useMemo(
    () =>
      activeModule?.contentType === "quiz"
        ? parseUniLioQuizJson(activeModule.quizJson, activeModule.quizPassingScore ?? 70)
        : null,
    [activeModule],
  );

  const [quizPassed, setQuizPassed] = useState(false);
  const [showCourseFeedback, setShowCourseFeedback] = useState(false);
  const [showCourseRecommendations, setShowCourseRecommendations] = useState(false);
  const [pendingCompletionModule, setPendingCompletionModule] = useState<UniLioModule | null>(null);

  const { data: courseRecommendations, isLoading: recommendationsLoading } = useUniLioCourseRecommendations(
    course.id,
    showCourseRecommendations,
  );

  useEffect(() => {
    setQuizPassed(false);
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeModuleId]);

  const completedCount = course.modules.filter((m) => m.isCompleted).length;

  const advanceAfterModule = (module: UniLioModule) => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    const idx = orderedModules.findIndex((m) => m.id === module.id);
    const next = idx >= 0 ? orderedModules[idx + 1] : undefined;
    if (next) {
      setActiveModuleId(next.id);
    }
  };

  const wouldCompleteCourse = (module: UniLioModule) =>
    orderedModules.every((m) => m.isCompleted || m.id === module.id);

  const completeModule = async (
    module: UniLioModule,
    feedback?: { contentRating: number; feedbackComment: string },
  ) => {
    await completeMutation.mutateAsync({
      courseId: course.id,
      moduleId: module.id,
      contentRating: feedback?.contentRating,
      feedbackComment: feedback?.feedbackComment,
    });

    if (!wouldCompleteCourse(module)) {
      advanceAfterModule(module);
    }
  };

  const handleCourseFeedbackSubmit = async (payload: {
    contentRating: number;
    feedbackComment: string;
  }) => {
    if (!pendingCompletionModule) return;

    await completeModule(pendingCompletionModule, payload);
    setPendingCompletionModule(null);
    setShowCourseFeedback(false);
    setShowCourseRecommendations(true);
  };

  const requestModuleCompletion = (module: UniLioModule) => {
    if (wouldCompleteCourse(module)) {
      setPendingCompletionModule(module);
      setShowCourseFeedback(true);
      return;
    }

    void completeModule(module);
  };

  return (
    <div className="unilio-player-focus">
      <header className="unilio-player-focus__topbar">
        <div className="unilio-player-focus__topbar-start">
          <Link to="/unilio/catalogo" className="unilio-player-focus__back" title="Voltar ao catálogo">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            <span>Catálogo</span>
          </Link>
          <div className="unilio-player-focus__course-meta">
            <h1 className="unilio-player-focus__title">{course.title}</h1>
            <p className="unilio-player-focus__subtitle">
              {course.instructorName}
              {course.area ? ` · ${course.area}` : ""}
              {(course.completedCount ?? 0) > 0 ? (
                <>
                  {" · "}
                  <span className="unilio-player-focus__completion-metric">
                    <i className="fa-solid fa-circle-check" aria-hidden="true" />{" "}
                    {course.completedCount === 1
                      ? "1 pessoa concluiu"
                      : `${course.completedCount} pessoas concluíram`}
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="unilio-player-focus__topbar-end">
          {isFallback ? (
            <span className="unilio-player-focus__offline" title="Dados locais — API indisponível">
              <i className="fa-solid fa-cloud-slash" aria-hidden="true" />
              Offline
            </span>
          ) : null}
          <div className="unilio-player-focus__progress-chip" aria-label={`Progresso: ${course.progressPct}%`}>
            <span>{completedCount}/{course.modules.length} módulos</span>
            <strong>{course.progressPct}%</strong>
          </div>
        </div>
      </header>

      <div className="unilio-player">
        <aside className="unilio-player__sidebar" aria-label="Módulos do curso">
          <div className="unilio-player__sidebar-head">
            <h2>Módulos</h2>
            <UniLioProgressBar value={course.progressPct} />
          </div>

          <ol className="unilio-player__module-list">
            {course.modules.map((module) => (
              <li key={module.id}>
                <button
                  type="button"
                  className={`unilio-player__module-btn${module.id === activeModuleId ? " is-active" : ""}${module.isCompleted ? " is-done" : ""}`}
                  onClick={() => {
                    setActiveModuleId(module.id);
                    setQuizPassed(false);
                  }}
                >
                  <span className="unilio-player__module-order" aria-hidden="true">
                    {module.isCompleted ? (
                      <i className="fa-solid fa-circle-check" />
                    ) : (
                      module.sortOrder
                    )}
                  </span>
                  <span className="unilio-player__module-text">
                    <span className="unilio-player__module-label">{module.title}</span>
                    <span className="unilio-player__module-duration">{formatUniLioDuration(module.durationMinutes)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <section className="unilio-player__content" aria-label="Conteúdo do módulo">
          {activeModule ? (
            <>
              <div ref={contentRef} className="unilio-player__content-scroll">
                <header className="unilio-player__content-head">
                  <div>
                    <p className="unilio-player__content-kicker">Módulo {activeModule.sortOrder}</p>
                    <h2>{activeModule.title}</h2>
                  </div>
                  <UniLioContentTypeBadge type={activeModule.contentType} />
                </header>

                {media?.kind === "embed" ? (
                  <div className="unilio-player__video-stage">
                    <div className="unilio-player__video">
                      <iframe
                        title={activeModule.title}
                        src={media.url}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null}

                {media?.kind === "video" ? (
                  <div className="unilio-player__video-stage">
                    <div className="unilio-player__video">
                      <video controls playsInline preload="metadata" src={media.url}>
                        Seu navegador não suporta reprodução de vídeo.
                      </video>
                    </div>
                  </div>
                ) : null}

                {media?.kind === "pdf" ? (
                  <div className="unilio-player__pdf">
                    <iframe title={activeModule.title} src={media.url} className="unilio-player__pdf-frame" />
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className="unilio-player__external-link">
                      Abrir PDF em nova aba
                    </a>
                  </div>
                ) : null}

                {media?.kind === "link" && media.provider ? (
                  <div className="unilio-player__external">
                    <span className="unilio-player__external-badge">
                      <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                      Conteúdo externo{media.provider ? ` — ${media.provider}` : ""}
                    </span>
                  </div>
                ) : null}

                {activeModule.contentType === "article" ? (
                  activeModule.articleHtml ? (
                    <article
                      className="unilio-player__article unilio-player__article--rich"
                      dangerouslySetInnerHTML={{
                        __html: stripDuplicateArticleTitle(activeModule.articleHtml, activeModule.title),
                      }}
                    />
                  ) : (
                    <article className="unilio-player__article">
                      <p>
                        Leia o material do módulo <strong>{activeModule.title}</strong> e marque como concluído para
                        avançar.
                      </p>
                    </article>
                  )
                ) : null}

                {activeModule.contentType === "quiz" && quizPayload ? (
                  <UniLioQuizWidget
                    moduleTitle={activeModule.title}
                    passingScore={quizPayload.passingScore}
                    questions={quizPayload.questions}
                    onSubmit={(_score, passed) => setQuizPassed(passed)}
                  />
                ) : null}

                {activeModule.contentType === "quiz" && !quizPayload ? (
                  <p className="unilio-panel__empty">Quiz deste módulo não está disponível.</p>
                ) : null}

                {media?.kind === "empty" &&
                activeModule.contentType !== "article" &&
                activeModule.contentType !== "quiz" ? (
                  <p className="unilio-panel__empty">Conteúdo deste módulo não disponível no protótipo.</p>
                ) : null}
              </div>

              <footer className="unilio-player__content-foot">
                {!activeModule.isCompleted ? (
                  <button
                    type="button"
                    className="unilio-player__complete-btn"
                    disabled={
                      completeMutation.isPending ||
                      (activeModule.contentType === "quiz" && !quizPassed)
                    }
                    onClick={() => requestModuleCompletion(activeModule)}
                  >
                    {completeMutation.isPending ? (
                      "Salvando…"
                    ) : activeModule.contentType === "quiz" && !quizPassed ? (
                      "Aprove no quiz para concluir"
                    ) : (
                      <>
                        Marcar conteúdo como concluído
                        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                      </>
                    )}
                  </button>
                ) : (
                  <p className="unilio-player__done-msg">
                    <i className="fa-solid fa-circle-check" aria-hidden="true" /> Módulo concluído
                  </p>
                )}
              </footer>
            </>
          ) : (
            <p className="unilio-panel__empty">Selecione um módulo para iniciar.</p>
          )}
        </section>
      </div>

      <UniLioCourseFeedbackModal
        open={showCourseFeedback}
        courseTitle={course.title}
        busy={completeMutation.isPending}
        onSubmit={(payload) => void handleCourseFeedbackSubmit(payload)}
      />

      <UniLioCourseRecommendationsModal
        open={showCourseRecommendations}
        completedCourseTitle={course.title}
        items={courseRecommendations.items}
        isLoading={recommendationsLoading}
        onGoToCatalog={() => setShowCourseRecommendations(false)}
      />
    </div>
  );
}
