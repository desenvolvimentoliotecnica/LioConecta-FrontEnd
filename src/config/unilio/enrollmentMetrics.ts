import type { UniLioCourseEnrollmentRecord } from "./types";
import { COURSE_IDS_MAP } from "./mockSeed";

type MockEnrollmentSeed = {
  courseSeedKey: string;
  personName: string;
  status: string;
  startedAt: string;
  completedAt?: string | null;
};

const PERSON_NAMES: Record<string, string> = {
  julio: "Júlio Schwartzman",
  carlos: "Carlos Mendes",
  maria: "Maria Silva",
  ricardo: "Ricardo Souza",
  julia: "Julia Santos",
};

const MOCK_ENROLLMENT_SEEDS: MockEnrollmentSeed[] = [
  { courseSeedKey: "onboarding-liotecnica", personName: PERSON_NAMES.julio, status: "in_progress", startedAt: "2026-07-01T08:00:00-03:00" },
  { courseSeedKey: "onboarding-liotecnica", personName: PERSON_NAMES.julia, status: "completed", startedAt: "2026-03-20T09:00:00-03:00", completedAt: "2026-04-05T15:30:00-03:00" },
  { courseSeedKey: "onboarding-liotecnica", personName: PERSON_NAMES.carlos, status: "in_progress", startedAt: "2026-07-02T11:00:00-03:00" },
  { courseSeedKey: "ext-lean-manufacturing", personName: PERSON_NAMES.carlos, status: "in_progress", startedAt: "2026-06-15T10:00:00-03:00" },
  { courseSeedKey: "ext-lean-manufacturing", personName: PERSON_NAMES.ricardo, status: "completed", startedAt: "2026-04-15T13:00:00-03:00", completedAt: "2026-05-02T16:00:00-03:00" },
  { courseSeedKey: "ext-lean-manufacturing", personName: PERSON_NAMES.maria, status: "in_progress", startedAt: "2026-07-07T08:45:00-03:00" },
  { courseSeedKey: "ext-appcc-crq", personName: PERSON_NAMES.maria, status: "completed", startedAt: "2026-05-20T09:00:00-03:00", completedAt: "2026-06-10T16:30:00-03:00" },
  { courseSeedKey: "ext-nr35-altura", personName: PERSON_NAMES.ricardo, status: "in_progress", startedAt: "2026-04-01T08:00:00-03:00" },
  { courseSeedKey: "ext-power-bi-iniciantes", personName: PERSON_NAMES.julia, status: "in_progress", startedAt: "2026-07-05T14:00:00-03:00" },
  { courseSeedKey: "codigo-conduta", personName: PERSON_NAMES.julio, status: "in_progress", startedAt: "2026-07-08T09:15:00-03:00" },
  { courseSeedKey: "ext-lgpd-basico", personName: PERSON_NAMES.carlos, status: "completed", startedAt: "2026-06-01T10:00:00-03:00", completedAt: "2026-06-12T17:45:00-03:00" },
  { courseSeedKey: "seguranca-informacao", personName: PERSON_NAMES.maria, status: "completed", startedAt: "2026-05-10T08:30:00-03:00", completedAt: "2026-05-18T11:20:00-03:00" },
  { courseSeedKey: "seguranca-informacao", personName: PERSON_NAMES.julio, status: "in_progress", startedAt: "2026-07-03T10:00:00-03:00" },
  { courseSeedKey: "curso-gestao-pessoas-lider-rh", personName: PERSON_NAMES.julia, status: "in_progress", startedAt: "2026-07-06T14:20:00-03:00" },
  { courseSeedKey: "curso-devops-github-actions", personName: PERSON_NAMES.carlos, status: "completed", startedAt: "2026-06-20T09:00:00-03:00", completedAt: "2026-07-01T18:00:00-03:00" },
  { courseSeedKey: "feedback-efetivo", personName: PERSON_NAMES.maria, status: "completed", startedAt: "2026-05-01T08:00:00-03:00", completedAt: "2026-05-08T12:00:00-03:00" },
];

function courseIdFromSeedKey(seedKey: string) {
  return COURSE_IDS_MAP[seedKey] ?? null;
}

export function getEnrollmentStatsForCourse(courseId: string) {
  const records = MOCK_ENROLLMENT_SEEDS.filter((row) => courseIdFromSeedKey(row.courseSeedKey) === courseId);
  return {
    enrolledCount: records.length,
    completedCount: records.filter((row) => row.status === "completed").length,
  };
}

export function getEnrollmentRecordsForCourse(courseId: string): UniLioCourseEnrollmentRecord[] {
  return MOCK_ENROLLMENT_SEEDS
    .filter((row) => courseIdFromSeedKey(row.courseSeedKey) === courseId)
    .map((row, index) => ({
      personId: `enrollment-person-${index}`,
      personName: row.personName,
      status: row.status,
      startedAt: row.startedAt,
      completedAt: row.completedAt ?? null,
    }));
}
