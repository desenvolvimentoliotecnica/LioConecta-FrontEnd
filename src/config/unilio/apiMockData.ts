import type {
  UniLioAssessmentsDto,
  UniLioCatalogPageDto,
  UniLioCertificatesDto,
  UniLioCommunityPageDto,
  UniLioComplianceDto,
  UniLioCourseDetailDto,
  UniLioDashboardDto,
  UniLioEventsDto,
  UniLioInstructorCoursesDto,
  UniLioManagerTeamDto,
  UniLioMetaDto,
  UniLioPathsDto,
  UniLioPathDetailDto,
  UniLioRecommendationsDto,
  UniLioReportsDto,
  UniLioSkillsDto,
  UniLioQuestionsPageDto,
  UniLioQuestionDetailDto,
} from "../../api/types";
import type { UniLioFilters } from "./types";
import { COURSE_IDS_MAP, MOCK_COURSES, PATH_IDS, getMockCourse } from "./mockSeed";
import {
  getEnrollmentRecordsForCourse,
  getEnrollmentStatsForCourse,
} from "./enrollmentMetrics";

export const COURSE_IDS = {
  codigoConduta: COURSE_IDS_MAP["codigo-conduta"],
  segurancaInfo: COURSE_IDS_MAP["seguranca-informacao"],
  onboarding: COURSE_IDS_MAP["onboarding-liotecnica"],
  feedback: COURSE_IDS_MAP["feedback-efetivo"],
  nr35: COURSE_IDS_MAP["ext-nr35-altura"],
  appcc: COURSE_IDS_MAP["ext-appcc-crq"],
  gestaoPessoas: COURSE_IDS_MAP["ext-gestao-pessoas-rh"],
  lideranca: COURSE_IDS_MAP["ext-lideranca-negociar"],
} as const;

export const UNILIO_API_MOCK_META: UniLioMetaDto = {
  persona: "learner",
  areas: [
    "Tecnologia de Alimentos",
    "Qualidade",
    "Operações",
    "Compliance",
    "Gestão",
    "Soft Skills",
    "Técnico",
  ],
  departments: ["Produção", "Qualidade", "Industrial", "Corporativo", "RH", "Comercial", "TI"],
  contentTypes: ["video", "article", "quiz", "scorm", "live", "external", "pdf"],
  skills: ["Liofilização", "Qualidade Alimentar", "Lean Manufacturing", "Liderança", "Power BI", "Excel", "LGPD"],
};

function withEnrollmentMetrics(course: UniLioCourseDetailDto): UniLioCourseDetailDto {
  const stats = getEnrollmentStatsForCourse(course.id);
  return {
    ...course,
    enrolledCount: stats.enrolledCount,
    completedCount: stats.completedCount,
  };
}

function toSummary(course: UniLioCourseDetailDto) {
  const { modules: _modules, ...summary } = withEnrollmentMetrics(course);
  return summary;
}

function isMandatoryPending(course: UniLioCourseDetailDto) {
  return course.isMandatory && course.enrollmentStatus !== "completed";
}

/** Higher suffix ≈ newer course in the seeded catalog. */
function catalogRecencyKey(course: UniLioCourseDetailDto) {
  const lastPart = course.id.split("-")[4];
  return Number.parseInt(lastPart.slice(-4), 16);
}

function sortCatalogCourses(courses: UniLioCourseDetailDto[]) {
  return courses.slice().sort((a, b) => {
    const aPriority = isMandatoryPending(a) ? 1 : 0;
    const bPriority = isMandatoryPending(b) ? 1 : 0;
    if (bPriority !== aPriority) return bPriority - aPriority;
    return catalogRecencyKey(b) - catalogRecencyKey(a);
  });
}

function filterCourses(filters: UniLioFilters) {
  return MOCK_COURSES.filter((course) => {
    if (filters.area && course.area !== filters.area) return false;
    if (filters.department && course.department !== filters.department) return false;
    if (filters.contentType && course.contentType !== filters.contentType) return false;
    if (filters.status && course.enrollmentStatus !== filters.status) return false;
    if (filters.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      const hay = `${course.title} ${course.description} ${course.area} ${course.instructorName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function buildMockDashboard(filters: UniLioFilters): UniLioDashboardDto {
  const courses = filterCourses(filters);
  const inProgress = courses.filter((c) => c.enrollmentStatus === "in_progress");
  const completed = courses.filter((c) => c.enrollmentStatus === "completed");
  const mandatoryPending = courses.filter((c) => c.isMandatory && c.enrollmentStatus !== "completed");

  return {
    kpis: [
      {
        id: "enrolled",
        label: "Cursos matriculados",
        value: String(courses.length),
        delta: "+3",
        trend: "up",
        icon: "fa-book",
      },
      {
        id: "completed",
        label: "Concluídos",
        value: String(completed.length),
        delta: "+1",
        trend: "up",
        icon: "fa-circle-check",
      },
      {
        id: "mandatory",
        label: "Obrigatórios pendentes",
        value: String(mandatoryPending.length),
        delta: "0",
        trend: "neutral",
        icon: "fa-shield",
      },
      {
        id: "progress",
        label: "Progresso médio",
        value: `${Math.round(courses.reduce((s, c) => s + (c.progressPct ?? 0), 0) / Math.max(courses.length, 1))}%`,
        delta: "+5%",
        trend: "up",
        icon: "fa-chart-line",
      },
    ],
    activePath: {
      id: PATH_IDS.onboarding,
      seedKey: "path-onboarding-liotecnica",
      title: "Onboarding LioTécnica",
      description: "Boas-vindas, cultura, compliance e segurança para novos colaboradores.",
      courseCount: 4,
      progressPct: 50,
      completedCourses: 1,
    },
    alerts: [
      {
        id: "alert-1",
        severity: "warning",
        title: "Treinamentos obrigatórios pendentes",
        description: `${mandatoryPending.length} curso(s) de compliance aguardando conclusão.`,
        link: "/unilio/compliance",
      },
      {
        id: "alert-2",
        severity: "info",
        title: "Trilha de Onboarding disponível",
        description: "Complete os módulos institucionais nos primeiros 30 dias.",
        link: "/unilio/trilhas",
      },
    ],
    nextSteps: inProgress.map(toSummary),
    topRecommendations: [
      {
        courseId: COURSE_IDS.feedback,
        title: MOCK_COURSES.find((c) => c.id === COURSE_IDS.feedback)?.title ?? "Feedback Efetivo",
        reason: "Complementa sua trilha de liderança",
        area: "Gestão",
        durationMinutes: 45,
        contentType: "video",
      },
      {
        courseId: COURSE_IDS.appcc,
        title: MOCK_COURSES.find((c) => c.id === COURSE_IDS.appcc)?.title ?? "APPCC",
        reason: "Essencial para área de Qualidade",
        area: "Qualidade",
        durationMinutes: 35,
        contentType: "external",
      },
    ],
  };
}

export function buildMockCatalog(filters: UniLioFilters): UniLioCatalogPageDto {
  const filtered = sortCatalogCourses(filterCourses(filters));
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(toSummary);
  const totalCount = filtered.length;
  return {
    items,
    page,
    pageSize,
    totalCount,
    totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
  };
}

export function buildMockCourse(courseId: string): UniLioCourseDetailDto | null {
  const course = getMockCourse(courseId);
  return course ? withEnrollmentMetrics(course) : null;
}

export function buildMockCourseEnrollments(courseId: string) {
  const stats = getEnrollmentStatsForCourse(courseId);
  return {
    courseId,
    enrolledCount: stats.enrolledCount,
    completedCount: stats.completedCount,
    items: getEnrollmentRecordsForCourse(courseId),
  };
}

export function buildMockPaths(): UniLioPathsDto {
  return {
    items: [
      {
        id: PATH_IDS.onboarding,
        seedKey: "path-onboarding-liotecnica",
        title: "Onboarding LioTécnica",
        description: "Institucional, cultura, código de conduta e segurança da informação.",
        courseCount: 4,
        progressPct: 50,
        completedCourses: 1,
      },
      {
        id: PATH_IDS.lideranca,
        seedKey: "path-lideranca-essentials",
        title: "Liderança Essentials",
        description: "Gestão de pessoas, negociação e feedback para líderes.",
        courseCount: 3,
        progressPct: 33,
        completedCourses: 1,
      },
      {
        id: PATH_IDS.segurancaAlimentar,
        seedKey: "path-seguranca-alimentar",
        title: "Segurança Alimentar",
        description: "BPF, APPCC, FSSC 22000 e qualidade na indústria.",
        courseCount: 5,
        progressPct: 20,
        completedCourses: 1,
      },
    ],
  };
}

export function buildMockPathDetail(pathId: string): UniLioPathDetailDto | null {
  const paths = buildMockPaths().items;
  const path = paths.find((p) => p.id === pathId);
  if (!path) return null;

  const courseIdsByPath: Record<string, string[]> = {
    [PATH_IDS.onboarding]: [
      COURSE_IDS.onboarding,
      COURSE_IDS.codigoConduta,
      COURSE_IDS.segurancaInfo,
      COURSE_IDS.nr35,
    ],
    [PATH_IDS.lideranca]: [COURSE_IDS.gestaoPessoas, COURSE_IDS.lideranca, COURSE_IDS.feedback],
    [PATH_IDS.segurancaAlimentar]: [
      COURSE_IDS.appcc,
      COURSE_IDS_MAP["ext-bpf-usp"],
      COURSE_IDS_MAP["ext-appcc-usp"],
      COURSE_IDS_MAP["ext-fssc-22000"],
      COURSE_IDS_MAP["ext-custo-nao-qualidade"],
    ],
  };

  const courseIds = courseIdsByPath[pathId] ?? [];

  return {
    ...path,
    courses: MOCK_COURSES.filter((c) => courseIds.includes(c.id)).map(toSummary),
  };
}

export function buildMockAssessments(): UniLioAssessmentsDto {
  return {
    pending: [
      {
        id: "55555555-5555-5555-5555-555555550001",
        courseId: COURSE_IDS.codigoConduta,
        courseTitle: "Código de Conduta e Ética Corporativa",
        title: "Avaliação — Código de Conduta",
        passingScore: 70,
        lastScore: null,
        lastPassed: null,
        lastAttemptedAt: null,
        status: "pending",
      },
    ],
    history: [
      {
        id: "55555555-5555-5555-5555-555555550002",
        courseId: COURSE_IDS.appcc,
        courseTitle: "Introdução ao Sistema APPCC (HACCP)",
        title: "Avaliação APPCC",
        passingScore: 70,
        lastScore: 90,
        lastPassed: true,
        lastAttemptedAt: "2026-06-20T14:30:00Z",
        status: "passed",
      },
    ],
  };
}

export function buildMockCertificates(): UniLioCertificatesDto {
  return {
    items: [
      {
        id: "cert-0001-0000-4000-8000-000000000001",
        courseId: COURSE_IDS.feedback,
        courseTitle: "Feedback Efetivo para Líderes",
        certificateCode: "UNILIO-2026-LT-0042",
        issuedAt: "2026-06-15T15:00:00Z",
        area: "Gestão",
      },
    ],
  };
}

export function buildMockCompliance(): UniLioComplianceDto {
  return {
    items: [
      {
        courseId: COURSE_IDS.nr35,
        title: MOCK_COURSES.find((c) => c.id === COURSE_IDS.nr35)?.title ?? "NR-35",
        area: "Compliance",
        progressPct: 30,
        status: "in_progress",
        dueDate: "2026-07-31T23:59:59Z",
        isOverdue: false,
      },
      {
        courseId: COURSE_IDS.codigoConduta,
        title: "Código de Conduta e Ética Corporativa",
        area: "Compliance",
        progressPct: 0,
        status: "pending",
        dueDate: "2026-07-15T23:59:59Z",
        isOverdue: true,
      },
    ],
    completedCount: 1,
    pendingCount: 2,
    overdueCount: 1,
  };
}

export function buildMockCommunity(filters: UniLioFilters): UniLioCommunityPageDto {
  const items = [
    {
      id: "77777777-7777-7777-7777-777777770006",
      authorName: "Maria Silva",
      authorAvatarUrl: "/avatar-maria-silva.png",
      courseTitle: "Feedback Efetivo",
      body: "O módulo interno de feedback efetivo tem exemplos práticos de conversas difíceis. Sugiro para toda equipe de liderança.",
      likesCount: 18,
      createdAt: "2026-07-07T10:30:00Z",
    },
    {
      id: "77777777-7777-7777-7777-777777770001",
      authorName: "Carlos Mendes",
      authorAvatarUrl: "/avatar-carlos-mendes.png",
      courseTitle: "APPCC",
      body: "Excelente material do CRQ-SP sobre pontos críticos de controle na linha de produção.",
      likesCount: 12,
      createdAt: "2026-07-06T16:45:00Z",
    },
    {
      id: "77777777-7777-7777-7777-777777770004",
      authorName: "Julia Santos",
      authorAvatarUrl: "/avatar-julia-santos.png",
      courseTitle: "LGPD",
      body: "O quiz de LGPD é obrigatório para quem lida com dados de colaboradores no RH.",
      likesCount: 9,
      createdAt: "2026-07-05T09:00:00Z",
    },
  ];

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  return {
    items,
    page,
    pageSize,
    totalCount: items.length,
    totalPages: 1,
  };
}

export function buildMockRecommendations(): UniLioRecommendationsDto {
  return {
    items: buildMockDashboard({}).topRecommendations,
  };
}

export function buildMockCourseRecommendations(courseId: string): UniLioRecommendationsDto {
  const completed = MOCK_COURSES.find((c) => c.id === courseId);
  if (!completed) {
    return { items: [] };
  }

  const skillSet = new Set(completed.skillNames);
  const items = MOCK_COURSES.filter((course) => {
    if (course.id === courseId) return false;
    if (course.enrollmentStatus === "completed") return false;
    const sameArea = course.area === completed.area;
    const sharedSkill = course.skillNames.some((skill) => skillSet.has(skill));
    return sameArea || sharedSkill;
  })
    .sort((a, b) => {
      const aScore =
        (a.area === completed.area ? 2 : 0) +
        a.skillNames.filter((skill) => skillSet.has(skill)).length;
      const bScore =
        (b.area === completed.area ? 2 : 0) +
        b.skillNames.filter((skill) => skillSet.has(skill)).length;
      if (bScore !== aScore) return bScore - aScore;
      return b.rating - a.rating;
    })
    .slice(0, 3)
    .map((course) => {
      const sharedSkill = course.skillNames.find((skill) => skillSet.has(skill));
      return {
        courseId: course.id,
        title: course.title,
        reason: sharedSkill
          ? `Complementa o tema de ${sharedSkill}.`
          : `Relacionado à área de ${course.area}.`,
        area: course.area,
        durationMinutes: course.durationMinutes,
        contentType: course.contentType,
        thumbnailUrl: course.thumbnailUrl ?? null,
      };
    });

  return { items };
}

export function buildMockEvents(): UniLioEventsDto {
  return {
    items: [
      {
        id: "66666666-6666-6666-6666-666666660001",
        title: "Webinar: APPCC na prática",
        eventType: "live",
        startsAt: "2026-07-12T14:00:00Z",
        endsAt: "2026-07-12T15:30:00Z",
        instructorName: "Maria Silva",
        maxAttendees: 50,
        registeredCount: 32,
        isRegistered: true,
        meetingUrl: "https://teams.microsoft.com/l/meetup-join/example",
      },
      {
        id: "66666666-6666-6666-6666-666666660004",
        title: "Workshop: Power BI para gestores",
        eventType: "workshop",
        startsAt: "2026-07-20T09:00:00Z",
        endsAt: "2026-07-20T12:00:00Z",
        instructorName: "Ana Costa",
        maxAttendees: 25,
        registeredCount: 18,
        isRegistered: false,
        meetingUrl: null,
      },
    ],
  };
}

export function buildMockSkills(): UniLioSkillsDto {
  return {
    items: [
      {
        skillId: "44444444-4444-4444-4444-444444440004",
        name: "Liderança",
        category: "Soft Skills",
        currentLevel: 3,
        targetLevel: 4,
        relatedCourseTitles: ["Feedback Efetivo", "Gestão de Pessoas"],
      },
      {
        skillId: "44444444-4444-4444-4444-444444440002",
        name: "Qualidade Alimentar",
        category: "Técnico",
        currentLevel: 2,
        targetLevel: 4,
        relatedCourseTitles: ["APPCC", "BPF USP"],
      },
      {
        skillId: "44444444-4444-4444-4444-444444440008",
        name: "Segurança do Trabalho",
        category: "Compliance",
        currentLevel: 1,
        targetLevel: 3,
        relatedCourseTitles: ["NR-35 Trabalho em Altura"],
      },
    ],
  };
}

export function buildMockManagerTeam(): UniLioManagerTeamDto {
  return {
    members: [
      {
        personId: "p-carlos",
        name: "Carlos Mendes",
        department: "Qualidade",
        enrolledCount: 6,
        completedCount: 3,
        mandatoryPending: 1,
        avgProgressPct: 65,
      },
      {
        personId: "p-maria",
        name: "Maria Silva",
        department: "RH",
        enrolledCount: 5,
        completedCount: 4,
        mandatoryPending: 0,
        avgProgressPct: 78,
      },
      {
        personId: "p-ricardo",
        name: "Ricardo Souza",
        department: "Industrial",
        enrolledCount: 4,
        completedCount: 1,
        mandatoryPending: 2,
        avgProgressPct: 42,
      },
    ],
    totalMembers: 3,
    avgCompletionPct: 62,
  };
}

export function buildMockInstructorCourses(): UniLioInstructorCoursesDto {
  return {
    items: [
      {
        courseId: COURSE_IDS.feedback,
        title: "Feedback Efetivo para Líderes",
        area: "Gestão",
        enrolledCount: 48,
        completedCount: 22,
        avgRating: 4.8,
        status: "published",
      },
      {
        courseId: COURSE_IDS.onboarding,
        title: "Onboarding LioTécnica",
        area: "Institucional",
        enrolledCount: 120,
        completedCount: 85,
        avgRating: 4.9,
        status: "published",
      },
    ],
  };
}

export function buildMockReports(filters: UniLioFilters): UniLioReportsDto {
  return {
    metrics: [
      { label: "Taxa de conclusão", value: "68%", delta: "+4%" },
      { label: "Horas de aprendizado", value: "1.240h", delta: "+12%" },
      { label: "NPS UniLio", value: "4.6", delta: "+0.2" },
      { label: "Compliance", value: "82%", delta: "-3%" },
    ],
    topCourses: filterCourses(filters).slice(0, 5).map(toSummary),
    complianceGaps: buildMockCompliance().items.filter((i) => i.progressPct < 100),
  };
}

const MOCK_QUESTION_PUBLIC_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001";
const MOCK_QUESTION_PRIVATE_ID = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002";

export function buildMockModuleQuestions(
  courseId: string,
  moduleId: string,
): UniLioQuestionsPageDto {
  const course = getMockCourse(courseId);
  const module = course?.modules.find((m) => m.id === moduleId);
  return {
    items: [
      {
        id: MOCK_QUESTION_PUBLIC_ID,
        courseId,
        courseTitle: course?.title ?? "Curso",
        moduleId,
        moduleTitle: module?.title ?? "Módulo",
        authorPersonId: "seed-julio",
        authorName: "Júlio Schwartzman",
        body: "Qual a diferença entre onboarding presencial e remoto neste módulo?",
        visibility: "public",
        status: "answered",
        unread: false,
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        replyCount: 1,
        lastInstructorReply:
          "O onboarding remoto cobre os mesmos tópicos; a diferença está no formato das atividades práticas.",
        lastInstructorReplyAt: new Date(Date.now() - 43_200_000).toISOString(),
      },
    ],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
    unreadCount: 0,
  };
}

export function buildMockMyQuestions(): UniLioQuestionsPageDto {
  const courseId = COURSE_IDS.onboarding;
  const course = getMockCourse(courseId);
  const module = course?.modules[0];
  return {
    items: [
      {
        id: MOCK_QUESTION_PRIVATE_ID,
        courseId,
        courseTitle: course?.title ?? "Onboarding LioTécnica",
        moduleId: module?.id ?? null,
        moduleTitle: module?.title ?? null,
        authorPersonId: "seed-julio",
        authorName: "Você",
        body: "Posso refazer o quiz se não atingir a nota mínima?",
        visibility: "private",
        status: "open",
        unread: false,
        createdAt: new Date(Date.now() - 43_200_000).toISOString(),
        replyCount: 0,
      },
      {
        id: MOCK_QUESTION_PUBLIC_ID,
        courseId,
        courseTitle: course?.title ?? "Onboarding LioTécnica",
        moduleId: module?.id ?? null,
        moduleTitle: module?.title ?? null,
        authorPersonId: "seed-julio",
        authorName: "Você",
        body: "Qual a diferença entre onboarding presencial e remoto neste módulo?",
        visibility: "public",
        status: "answered",
        unread: true,
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        replyCount: 1,
        lastInstructorReply:
          "O onboarding remoto cobre os mesmos tópicos; a diferença está no formato das atividades práticas.",
        lastInstructorReplyAt: new Date(Date.now() - 43_200_000).toISOString(),
      },
    ],
    page: 1,
    pageSize: 20,
    totalCount: 2,
    totalPages: 1,
    unreadCount: 1,
  };
}

export function buildMockInstructorQuestions(): UniLioQuestionsPageDto {
  const courseId = COURSE_IDS.onboarding;
  const course = getMockCourse(courseId);
  const module = course?.modules[0];
  return {
    items: [
      {
        id: MOCK_QUESTION_PRIVATE_ID,
        courseId,
        courseTitle: course?.title ?? "Onboarding LioTécnica",
        moduleId: module?.id ?? null,
        moduleTitle: module?.title ?? null,
        authorPersonId: "seed-carlos",
        authorName: "Carlos Mendes",
        body: "Posso refazer o quiz se não atingir a nota mínima?",
        visibility: "private",
        status: "open",
        unread: true,
        createdAt: new Date(Date.now() - 21_600_000).toISOString(),
        replyCount: 0,
      },
      {
        id: MOCK_QUESTION_PUBLIC_ID,
        courseId,
        courseTitle: course?.title ?? "Onboarding LioTécnica",
        moduleId: module?.id ?? null,
        moduleTitle: module?.title ?? null,
        authorPersonId: "seed-julio",
        authorName: "Júlio Schwartzman",
        body: "Qual a diferença entre onboarding presencial e remoto neste módulo?",
        visibility: "public",
        status: "answered",
        unread: false,
        createdAt: new Date(Date.now() - 86_400_000).toISOString(),
        replyCount: 1,
        lastInstructorReply:
          "O onboarding remoto cobre os mesmos tópicos; a diferença está no formato das atividades práticas.",
        lastInstructorReplyAt: new Date(Date.now() - 43_200_000).toISOString(),
      },
    ],
    page: 1,
    pageSize: 20,
    totalCount: 2,
    totalPages: 1,
    unreadCount: 1,
  };
}

export function buildMockQuestionDetail(id: string): UniLioQuestionDetailDto {
  const instructor = buildMockInstructorQuestions().items.find((q) => q.id === id)
    ?? buildMockMyQuestions().items.find((q) => q.id === id);
  if (!instructor) {
    throw new Error("Pergunta não encontrada");
  }
  return {
    ...instructor,
    replies:
      instructor.status === "answered"
        ? [
            {
              id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb003",
              authorName: "Maria Silva",
              isInstructorReply: true,
              body: "O onboarding remoto cobre os mesmos tópicos; a diferença está no formato das atividades práticas.",
              createdAt: new Date(Date.now() - 43_200_000).toISOString(),
            },
          ]
        : [],
  };
}

export { MOCK_COURSES };
