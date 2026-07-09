export type UniLioPersona = "learner" | "manager" | "instructor" | "admin";

export type UniLioContentType = "video" | "article" | "quiz" | "scorm" | "live" | "external" | "pdf";

export type UniLioFilters = {
  area?: string;
  department?: string;
  contentType?: string;
  status?: string;
  search?: string;
  period?: string;
  page?: number;
  pageSize?: number;
};

export type UniLioPersonaContext = {
  persona: UniLioPersona;
  label: string;
  readOnly: boolean;
};

export type UniLioKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  mod?: string;
  href?: string;
};

export type UniLioIntegrationLink = {
  sourceType: string;
  sourceKey: string;
  label: string;
};

export type UniLioCourseSummary = {
  id: string;
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
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  provider?: string | null;
  status: string;
  progressPct?: number | null;
  enrollmentStatus?: string | null;
  skillNames: string[];
  integrations: UniLioIntegrationLink[];
  enrolledCount: number;
  completedCount: number;
};

export type UniLioCourseEnrollmentRecord = {
  personId: string;
  personName: string;
  status: string;
  startedAt?: string | null;
  completedAt?: string | null;
};

export type UniLioCourseEnrollmentsView = {
  courseId: string;
  enrolledCount: number;
  completedCount: number;
  items: UniLioCourseEnrollmentRecord[];
};

export type UniLioModule = {
  id: string;
  sortOrder: number;
  title: string;
  contentType: string;
  contentUrl?: string | null;
  durationMinutes: number;
  articleHtml?: string | null;
  quizJson?: string | null;
  quizPassingScore?: number | null;
  isCompleted: boolean;
};

export type UniLioCourseDetail = UniLioCourseSummary & {
  progressPct: number;
  enrollmentStatus: string;
  modules: UniLioModule[];
};

export type UniLioPathSummary = {
  id: string;
  seedKey: string;
  title: string;
  description: string;
  courseCount: number;
  progressPct: number;
  completedCourses: number;
};

export type UniLioPathDetail = UniLioPathSummary & {
  courses: UniLioCourseSummary[];
};

export type UniLioAlert = {
  id: string;
  severity: string;
  title: string;
  description: string;
  link: string;
};

export type UniLioRecommendation = {
  courseId: string;
  title: string;
  reason: string;
  area: string;
  durationMinutes: number;
  contentType: string;
  thumbnailUrl?: string | null;
};

export type UniLioDashboardView = {
  kpis: UniLioKpi[];
  activePath: UniLioPathSummary | null;
  alerts: UniLioAlert[];
  nextSteps: UniLioCourseSummary[];
  topRecommendations: UniLioRecommendation[];
};

export type UniLioCatalogView = {
  items: UniLioCourseSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type UniLioPathsView = {
  items: UniLioPathSummary[];
};

export type UniLioAssessmentSummary = {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  passingScore: number;
  lastScore?: number | null;
  lastPassed?: boolean | null;
  lastAttemptedAt?: string | null;
  status: string;
};

export type UniLioAssessmentsView = {
  pending: UniLioAssessmentSummary[];
  history: UniLioAssessmentSummary[];
};

export type UniLioCertificate = {
  id: string;
  courseId: string;
  courseTitle: string;
  certificateCode: string;
  issuedAt: string;
  area: string;
};

export type UniLioCertificatesView = {
  items: UniLioCertificate[];
};

export type UniLioComplianceItem = {
  courseId: string;
  title: string;
  area: string;
  progressPct: number;
  status: string;
  dueDate?: string | null;
  isOverdue: boolean;
};

export type UniLioComplianceView = {
  items: UniLioComplianceItem[];
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
};

export type UniLioCommunityPost = {
  id: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  courseTitle?: string | null;
  body: string;
  likesCount: number;
  createdAt: string;
};

export type UniLioCommunityView = {
  items: UniLioCommunityPost[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type UniLioRecommendationsView = {
  items: UniLioRecommendation[];
};

export type UniLioEvent = {
  id: string;
  title: string;
  eventType: string;
  startsAt: string;
  endsAt: string;
  instructorName?: string | null;
  maxAttendees: number;
  registeredCount: number;
  isRegistered: boolean;
  meetingUrl?: string | null;
};

export type UniLioEventsView = {
  items: UniLioEvent[];
};

export type UniLioSkillLevel = {
  skillId: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  relatedCourseTitles: string[];
};

export type UniLioSkillsView = {
  items: UniLioSkillLevel[];
};

export type UniLioTeamMember = {
  personId: string;
  name: string;
  department: string;
  enrolledCount: number;
  completedCount: number;
  mandatoryPending: number;
  avgProgressPct: number;
};

export type UniLioManagerTeamView = {
  members: UniLioTeamMember[];
  totalMembers: number;
  avgCompletionPct: number;
};

export type UniLioInstructorCourse = {
  courseId: string;
  title: string;
  area: string;
  enrolledCount: number;
  completedCount: number;
  avgRating: number;
  status: string;
};

export type UniLioInstructorCoursesView = {
  items: UniLioInstructorCourse[];
};

export type UniLioReportMetric = {
  label: string;
  value: string;
  delta: string;
};

export type UniLioReportsView = {
  metrics: UniLioReportMetric[];
  topCourses: UniLioCourseSummary[];
  complianceGaps: UniLioComplianceItem[];
};

export type UniLioProgressResult = {
  courseId: string;
  progressPct: number;
  status: string;
  courseCompleted: boolean;
};

export type UniLioMetaView = {
  persona: UniLioPersona;
  areas: string[];
  departments: string[];
  contentTypes: string[];
  skills: string[];
};

export type UniLioPlayerView = {
  course: UniLioCourseDetail;
  currentModule: UniLioModule | null;
  nextModule: UniLioModule | null;
};
