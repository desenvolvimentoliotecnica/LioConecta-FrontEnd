import type { UniLioCourseDetailDto, UniLioModuleDto } from "../../api/types";
import catalogJson from "./data/unilio-catalog.json";
import overlayJson from "./data/unilio-content-overlay.json";
import newCoursesOverlayJson from "./data/unilio-new-courses-overlay.json";

type SeedModule = {
  sortOrder: number;
  title: string;
  contentType: string;
  contentUrl?: string | null;
  durationMinutes: number;
  articleHtml?: string | null;
  quizJson?: string | null;
};

type SeedCourse = {
  seedKey: string;
  title: string;
  description: string;
  contentType: string;
  durationMinutes: number;
  isMandatory: boolean;
  area: string;
  department: string;
  rating: number;
  instructorName: string;
  externalUrl?: string | null;
  provider?: string | null;
  thumbnailUrl?: string | null;
  status: string;
  skillSeedKeys?: string[];
  modules: SeedModule[];
};

const COURSE_IDS: Record<string, string> = {
  "ext-liofilizacao-ufv": "22222222-2222-2222-2222-222222220001",
  "ext-eng-alimentos-podcast": "22222222-2222-2222-2222-222222220002",
  "ext-custo-nao-qualidade": "22222222-2222-2222-2222-222222220003",
  "ext-stp-alimenticia": "22222222-2222-2222-2222-222222220004",
  "ext-appcc-crq": "22222222-2222-2222-2222-222222220005",
  "ext-fssc-22000": "22222222-2222-2222-2222-222222220006",
  "ext-lean-manufacturing": "22222222-2222-2222-2222-222222220007",
  "ext-lean-six-sigma": "22222222-2222-2222-2222-222222220008",
  "ext-instrumentacao": "22222222-2222-2222-2222-222222220009",
  "ext-tpm-manutencao": "22222222-2222-2222-2222-22222222000a",
  "ext-nr35-altura": "22222222-2222-2222-2222-22222222000b",
  "ext-gestao-pessoas-rh": "22222222-2222-2222-2222-22222222000c",
  "ext-lideranca-negociar": "22222222-2222-2222-2222-22222222000d",
  "ext-power-bi-iniciantes": "22222222-2222-2222-2222-22222222000e",
  "ext-power-bi-curso": "22222222-2222-2222-2222-22222222000f",
  "ext-excel-tabela-dinamica": "22222222-2222-2222-2222-222222220010",
  "ext-excel-entrevista": "22222222-2222-2222-2222-222222220011",
  "ext-lgpd-basico": "22222222-2222-2222-2222-222222220012",
  "ext-lgpd-pme": "22222222-2222-2222-2222-222222220013",
  "ext-nr35-resumo": "22222222-2222-2222-2222-222222220014",
  "ext-bpf-usp": "22222222-2222-2222-2222-222222220015",
  "ext-appcc-usp": "22222222-2222-2222-2222-222222220016",
  "codigo-conduta": "22222222-2222-2222-2222-222222220017",
  "seguranca-informacao": "22222222-2222-2222-2222-222222220018",
  "feedback-efetivo": "22222222-2222-2222-2222-222222220019",
  "onboarding-liotecnica": "22222222-2222-2222-2222-22222222001a",
  "curso-gestao-pessoas-lider-rh": "22222222-2222-2222-2222-22222222001b",
  "curso-rh-agil-catharino": "22222222-2222-2222-2222-22222222001c",
  "curso-devops-github-actions": "22222222-2222-2222-2222-22222222001d",
};

export const PATH_IDS = {
  onboarding: "33333333-3333-3333-3333-333333330001",
  liofilizacao: "33333333-3333-3333-3333-333333330002",
  segurancaAlimentar: "33333333-3333-3333-3333-333333330003",
  excelencia: "33333333-3333-3333-3333-333333330004",
  lideranca: "33333333-3333-3333-3333-333333330005",
} as const;

const SKILL_LABELS: Record<string, string> = {
  liofilizacao: "Liofilização",
  "qualidade-alimentar": "Qualidade Alimentar",
  "lean-manufacturing": "Lean Manufacturing",
  lideranca: "Liderança",
  "power-bi": "Power BI",
  excel: "Excel",
  lgpd: "LGPD",
  "seguranca-trabalho": "Segurança do Trabalho",
  "devops-cicd": "DevOps e CI/CD",
};

/** Uses last 4 hex digits of the course GUID tail — mirrors backend ResolveCourseNumericSuffix. */
function resolveCourseNumericSuffix(courseId: string): number {
  const lastPart = courseId.split("-")[4];
  return Number.parseInt(lastPart.slice(-4), 16);
}

function resolveModuleId(courseSeedKey: string, sortOrder: number): string {
  const courseId = COURSE_IDS[courseSeedKey];
  const suffix = resolveCourseNumericSuffix(courseId);
  const moduleSuffix = `${suffix.toString(16).padStart(4, "0")}${sortOrder.toString(16).padStart(4, "0")}0000`;
  return `22222222-2222-2222-2222-${moduleSuffix}`;
}

function parseQuizPassingScore(quizJson?: string | null): number | null {
  if (!quizJson) return null;
  try {
    const parsed = JSON.parse(quizJson) as { passingScore?: number };
    return typeof parsed.passingScore === "number" ? parsed.passingScore : null;
  } catch {
    return null;
  }
}

function mergeCourses(): SeedCourse[] {
  const catalog = catalogJson as { courses: SeedCourse[] };
  const overlay = overlayJson as { courses: Partial<SeedCourse>[] };
  const index = new Map(catalog.courses.map((c, i) => [c.seedKey, i]));

  const courses = catalog.courses.map((c) => ({ ...c, modules: [...c.modules] }));

  const overlayPatches = [
    ...overlay.courses,
    ...(newCoursesOverlayJson as { courses: Partial<SeedCourse>[] }).courses,
  ];

  for (const patch of overlayPatches) {
    if (!patch.seedKey || !index.has(patch.seedKey)) continue;
    const i = index.get(patch.seedKey)!;
    const existing = courses[i];
    courses[i] = {
      ...existing,
      title: patch.title?.trim() ? patch.title : existing.title,
      description: patch.description?.trim() ? patch.description : existing.description,
      durationMinutes: patch.durationMinutes && patch.durationMinutes > 0 ? patch.durationMinutes : existing.durationMinutes,
      thumbnailUrl: patch.thumbnailUrl ?? existing.thumbnailUrl ?? null,
      modules: patch.modules && patch.modules.length > 0 ? patch.modules : existing.modules,
    };
  }

  return courses;
}

type EnrollmentMock = {
  progressPct: number;
  enrollmentStatus: string;
  completedModules: number;
};

const ENROLLMENT_MOCK: Record<string, EnrollmentMock> = {
  "onboarding-liotecnica": { progressPct: 75, enrollmentStatus: "in_progress", completedModules: 3 },
  "codigo-conduta": { progressPct: 0, enrollmentStatus: "not_started", completedModules: 0 },
  "seguranca-informacao": { progressPct: 50, enrollmentStatus: "in_progress", completedModules: 2 },
  "feedback-efetivo": { progressPct: 100, enrollmentStatus: "completed", completedModules: 99 },
  "ext-nr35-altura": { progressPct: 30, enrollmentStatus: "in_progress", completedModules: 1 },
  "ext-appcc-crq": { progressPct: 100, enrollmentStatus: "completed", completedModules: 99 },
  "ext-gestao-pessoas-rh": { progressPct: 60, enrollmentStatus: "in_progress", completedModules: 1 },
  "ext-lideranca-negociar": { progressPct: 0, enrollmentStatus: "not_started", completedModules: 0 },
  "curso-gestao-pessoas-lider-rh": { progressPct: 0, enrollmentStatus: "not_started", completedModules: 0 },
  "curso-rh-agil-catharino": { progressPct: 10, enrollmentStatus: "in_progress", completedModules: 1 },
  "curso-devops-github-actions": { progressPct: 0, enrollmentStatus: "not_started", completedModules: 0 },
};

function mapModule(seedKey: string, module: SeedModule, isCompleted: boolean): UniLioModuleDto {
  return {
    id: resolveModuleId(seedKey, module.sortOrder),
    sortOrder: module.sortOrder,
    title: module.title,
    contentType: module.contentType,
    contentUrl: module.contentUrl ?? null,
    durationMinutes: module.durationMinutes,
    articleHtml: module.articleHtml ?? null,
    quizJson: module.quizJson ?? null,
    quizPassingScore: parseQuizPassingScore(module.quizJson),
    isCompleted,
    attachments: [],
  };
}

function mapCourse(seed: SeedCourse): UniLioCourseDetailDto {
  const enrollment = ENROLLMENT_MOCK[seed.seedKey] ?? {
    progressPct: 0,
    enrollmentStatus: "not_started",
    completedModules: 0,
  };

  const modules = seed.modules
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m, idx) =>
      mapModule(
        seed.seedKey,
        m,
        enrollment.completedModules >= 99 ? true : idx < enrollment.completedModules,
      ),
    );

  const progressPct =
    enrollment.progressPct > 0
      ? enrollment.progressPct
      : modules.length > 0
        ? Math.round((modules.filter((m) => m.isCompleted).length / modules.length) * 100)
        : 0;

  return {
    id: COURSE_IDS[seed.seedKey],
    seedKey: seed.seedKey,
    title: seed.title,
    description: seed.description,
    contentType: seed.contentType,
    durationMinutes: seed.durationMinutes,
    isMandatory: seed.isMandatory,
    area: seed.area,
    department: seed.department,
    rating: seed.rating,
    instructorName: seed.instructorName,
    thumbnailUrl: seed.thumbnailUrl ?? null,
    externalUrl: seed.externalUrl ?? null,
    provider: seed.provider ?? null,
    status: seed.status,
    progressPct,
    enrollmentStatus: enrollment.enrollmentStatus,
    skillNames: (seed.skillSeedKeys ?? []).map((k) => SKILL_LABELS[k] ?? k),
    integrations: [],
    enrolledCount: 0,
    completedCount: 0,
    modules,
  };
}

const MERGED_COURSES = mergeCourses().map(mapCourse);

export const MOCK_COURSES: UniLioCourseDetailDto[] = MERGED_COURSES;

export const COURSE_IDS_MAP = COURSE_IDS;

export function getMockCourse(courseId: string): UniLioCourseDetailDto | null {
  return MOCK_COURSES.find((c) => c.id === courseId) ?? null;
}
