export type UserRole =
  | "Employee"
  | "Manager"
  | "HR"
  | "TI"
  | "Facilities"
  | "Legal"
  | "Admin"
  | "AnalyticsViewer"
  | "KioskReader";

export interface MeDto {
  id: string;
  slug: string;
  name: string;
  email: string;
  title?: string | null;
  photoUrl?: string | null;
  departmentName?: string | null;
  roles: Array<UserRole | number>;
}

export interface PagedResult<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface NotificationDto {
  id: string;
  type: string | number;
  title: string;
  body: string;
  href?: string | null;
  isRead: boolean;
  createdAt: string;
}

export type PostType =
  | "Social"
  | "Comunicado"
  | "Poll"
  | "Celebration"
  | "News"
  | "MoodCheck";

export const POST_TYPE_SOCIAL = 0 as const;
export const POST_TYPE_COMUNICADO = 1 as const;
export const POST_TYPE_POLL = 2 as const;

export interface PersonSummaryDto {
  id: string;
  slug: string;
  name: string;
  title?: string | null;
  photoUrl?: string | null;
  departmentName?: string | null;
  location?: string | null;
  isActive: boolean;
}

export interface CommentDto {
  id: string;
  text: string;
  author: PersonSummaryDto;
  createdAt: string;
}

export interface PollOptionDto {
  id: string;
  text: string;
  voteCount: number;
  sortOrder: number;
  isSelectedByViewer: boolean;
}

export interface PollDto {
  id: string;
  postId: string;
  question: string;
  endsAt?: string | null;
  hasViewerVoted: boolean;
  options: PollOptionDto[];
}

export interface FeedPostDto {
  id: string;
  type: number;
  content: string;
  author: PersonSummaryDto;
  createdAt: string;
  isPinned: boolean;
  metadata: Record<string, unknown>;
  commentCount: number;
  reactionCount: number;
  viewerReaction?: string | null;
  comments: CommentDto[];
  poll?: PollDto | null;
}

export interface CreatePollRequest {
  question: string;
  options: string[];
  heroImageUrl?: string | null;
  endsAt?: string | null;
}

export interface VotePollRequest {
  optionId: string;
}

export interface CreateCommentRequest {
  text: string;
}

export interface CreatePostRequest {
  type: number;
  content: string;
  metadata?: Record<string, unknown> | null;
}

export const COMUNICADO_KIND_OFICIAL = 0 as const;
export const COMUNICADO_KIND_DEPARTAMENTAL = 1 as const;
export const COMUNICADO_KIND_URGENTE = 2 as const;
export const COMUNICADO_KIND_ARQUIVO = 3 as const;

export type ComunicadoKind =
  | typeof COMUNICADO_KIND_OFICIAL
  | typeof COMUNICADO_KIND_DEPARTAMENTAL
  | typeof COMUNICADO_KIND_URGENTE
  | typeof COMUNICADO_KIND_ARQUIVO;

export interface ComunicadoDto {
  id: string;
  slug?: string | null;
  kind: ComunicadoKind;
  title: string;
  excerpt?: string | null;
  content: Record<string, unknown>;
  author: PersonSummaryDto;
  heroImageUrl?: string | null;
  isMandatory: boolean;
  publishedAt?: string | null;
  isReadByViewer: boolean;
}

export interface ComunicadoListItemDto {
  id: string;
  slug?: string | null;
  kind: ComunicadoKind;
  title: string;
  excerpt?: string | null;
  author: PersonSummaryDto;
  heroImageUrl?: string | null;
  isMandatory: boolean;
  publishedAt?: string | null;
  archivedAt?: string | null;
  isReadByViewer: boolean;
}

export interface ComunicadoHubDto {
  oficiaisCount: number;
  departamentaisCount: number;
  urgentesCount: number;
  urgentesUnreadCount: number;
  arquivoCount: number;
  recent: ComunicadoListItemDto[];
}

export interface CreateComunicadoRequest {
  kind: ComunicadoKind;
  title: string;
  excerpt?: string | null;
  content?: Record<string, unknown> | null;
  heroImageUrl?: string | null;
  isMandatory: boolean;
  publishedAt?: string | null;
}

export interface ComunicadoHeroTemplateDto {
  id: string;
  label: string;
  url: string;
  category?: string | null;
}

export interface ComunicadoHeroUploadDto {
  id: string;
  assetId: string;
  version: number;
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy?: PersonSummaryDto | null;
}

export interface UploadComunicadoHeroResponseDto {
  id: string;
  assetId: string;
  version: number;
  url: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export const GROUP_STATUS_PENDING = 0 as const;
export const GROUP_STATUS_ACTIVE = 1 as const;
export const GROUP_STATUS_REJECTED = 2 as const;

export type GroupStatus =
  | typeof GROUP_STATUS_PENDING
  | typeof GROUP_STATUS_ACTIVE
  | typeof GROUP_STATUS_REJECTED;

export const GROUP_TYPE_DEPARTAMENTAL = 0 as const;
export const GROUP_TYPE_PROJETO = 1 as const;
export const GROUP_TYPE_INTERESSE = 2 as const;
export const GROUP_TYPE_COMUNIDADE = 3 as const;

export type GroupType =
  | typeof GROUP_TYPE_DEPARTAMENTAL
  | typeof GROUP_TYPE_PROJETO
  | typeof GROUP_TYPE_INTERESSE
  | typeof GROUP_TYPE_COMUNIDADE;

export const GROUP_ACCESS_OPEN = 0 as const;
export const GROUP_ACCESS_REQUIRES_APPROVAL = 1 as const;
export const GROUP_ACCESS_PRIVATE = 2 as const;

export type GroupAccessMode =
  | typeof GROUP_ACCESS_OPEN
  | typeof GROUP_ACCESS_REQUIRES_APPROVAL
  | typeof GROUP_ACCESS_PRIVATE;

export interface GroupDto {
  id: string;
  name: string;
  description?: string | null;
  type: GroupType;
  accessMode: GroupAccessMode;
  icon: string;
  status: GroupStatus;
  isPrivate: boolean;
  owner: PersonSummaryDto;
  memberCount: number;
  postCount: number;
  isMember: boolean;
  createdAt: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export interface CreateGroupRequest {
  name: string;
  description?: string | null;
  type: GroupType;
  accessMode: GroupAccessMode;
  icon: string;
}

export interface RejectGroupRequest {
  reason?: string | null;
}

export interface AnalyticsTrendPointDto {
  label: string;
  value: number;
}

export interface AnalyticsServiceSliceDto {
  label: string;
  value: number;
  color: string;
}

export interface AnalyticsDepartmentDto {
  name: string;
  activeUsers: number;
  engagement: number;
}

export interface AnalyticsTopItemDto {
  title: string;
  meta: string;
  value: number;
  href: string;
  mod: string;
}

export interface AnalyticsSnapshotDto {
  period: string;
  activePeople: number;
  activeUsersInPeriod: number;
  feedPosts: number;
  feedComments: number;
  feedReactions: number;
  comunicados: number;
  comunicadoReads: number;
  activeGroups: number;
  groupMembers: number;
  groupPosts: number;
  notifications: number;
  serviceRequests: number;
  documents: number;
  moodChecks: number;
  pollsCreated?: number;
  pollVotes?: number;
  activePolls?: number;
  pollsClosed?: number;
  pollParticipationRate?: number;
  pollAvgVotesPerPoll?: number;
  pollActivityTrend?: AnalyticsTrendPointDto[];
  topPolls?: AnalyticsTopItemDto[];
  activityTrend: AnalyticsTrendPointDto[];
  serviceBreakdown: AnalyticsServiceSliceDto[];
  departmentEngagement: AnalyticsDepartmentDto[];
  topContent: AnalyticsTopItemDto[];
}

export interface AppSettingDto {
  key: string;
  category: string;
  label: string;
  description?: string | null;
  value: string;
  valueType: string;
  isSecret: boolean;
  hasValue: boolean;
  sortOrder: number;
  updatedAt?: string | null;
}

export interface AppSettingCategoryDto {
  id: string;
  label: string;
  description?: string | null;
  settings: AppSettingDto[];
}

export interface UpdateAppSettingRequest {
  key: string;
  value: string;
}

export interface BulkUpdateAppSettingsRequest {
  settings: UpdateAppSettingRequest[];
}

export interface AppSettingsUpdateResultDto {
  categories: AppSettingCategoryDto[];
  requiresRestart: boolean;
  message?: string | null;
}

export interface UserPreferencesDto {
  bookmarks: string[];
  favorites: string[];
  shortcuts: string[];
}

export interface UpdatePreferencesRequest {
  bookmarks?: string[];
  favorites?: string[];
  shortcuts?: string[];
}

export interface PayslipSummaryDto {
  latestCompetence: string;
  latestNetAmount: number;
  historyCount: number;
}

export interface PayslipServiceDto {
  id: string;
  title: string;
  desc: string;
  category: string;
  sla: string;
  online: boolean;
  featured: boolean;
  action: string;
  helpText: string;
}

export interface PayslipLineDto {
  code: string;
  label: string;
  amount: number;
  quantity?: number | null;
}

export interface PayslipListItemDto {
  year: number;
  month: number;
  competence: string;
  grossAmount: number;
  netAmount: number;
  publishedAt: string;
}

export interface PayslipDetailDto {
  year: number;
  month: number;
  competence: string;
  grossAmount: number;
  netAmount: number;
  deductionsTotal: number;
  earnings: PayslipLineDto[];
  deductions: PayslipLineDto[];
  publishedAt: string;
}

export interface PayslipComparativoDto {
  from: PayslipDetailDto;
  to: PayslipDetailDto;
  netDifference: number;
  grossDifference: number;
}

export interface FgtsDepositDto {
  competence: string;
  amount: number;
  employerShare: number;
}

export interface FgtsConsultaDto {
  totalBalance: number;
  deposits: FgtsDepositDto[];
}

export interface DescontoItemDto {
  code: string;
  label: string;
  amount: number;
  competence: string;
}

export interface DescontosConsultaDto {
  totalMonthly: number;
  items: DescontoItemDto[];
}

export interface RubricaHelpDto {
  code: string;
  label: string;
  description: string;
}

export interface RubricasConsultaDto {
  items: RubricaHelpDto[];
}

export interface IncomeStatementLineDto {
  month: number;
  paid: number;
  withheld: number;
}

export interface IncomeStatementDto {
  year: number;
  totalPaid: number;
  totalWithheld: number;
  lines: IncomeStatementLineDto[];
}

export interface CreatePayslipRequestDto {
  serviceId: string;
  competence?: string | null;
  notes?: string | null;
}

export interface PayslipRequestResultDto {
  requestId: string;
  status: string;
  message: string;
}

export interface BenefitSummaryDto {
  activeCount: number;
  totalMonthlyValue: number;
  dependentsCount: number;
}

export interface BenefitListItemDto {
  id: string;
  title: string;
  desc: string;
  category: string;
  provider: string;
  status: string;
  featured: boolean;
  isActive: boolean;
  portalUrl?: string | null;
  monthlyValue?: number | null;
}

export interface BenefitDetailLineDto {
  label: string;
  amount?: number | null;
  note?: string | null;
}

export interface BenefitDependentDto {
  name: string;
  relation: string;
  monthlyValue?: number | null;
}

export interface BenefitDetailDto {
  id: string;
  title: string;
  desc: string;
  category: string;
  provider: string;
  status: string;
  featured: boolean;
  portalUrl?: string | null;
  helpText: string;
  monthlyValue?: number | null;
  lines: BenefitDetailLineDto[];
  dependents: BenefitDependentDto[];
  notes: string[];
}

export interface CreateBenefitRequestDto {
  benefitId: string;
  notes?: string | null;
}

export interface BenefitRequestResultDto {
  requestId: string;
  status: string;
  message: string;
}

export interface LeaveSummaryDto {
  availableDays: number;
  pendingRequests: number;
  nextScheduledLabel?: string | null;
}

export interface LeaveServiceDto {
  id: string;
  title: string;
  desc: string;
  category: string;
  sla: string;
  online: boolean;
  featured: boolean;
  action: string;
  helpText: string;
  portalUrl?: string | null;
}

export interface LeavePeriodDto {
  label: string;
  acquiredDays: number;
  usedDays: number;
  availableDays: number;
  expiresAt?: string | null;
}

export interface LeaveBalanceDto {
  availableDays: number;
  acquiredDays: number;
  scheduledDays: number;
  expiredDays: number;
  periods: LeavePeriodDto[];
  notes: string[];
}

export interface LeaveHistoryItemDto {
  id: string;
  title: string;
  recordType: string;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  days?: number | null;
  note?: string | null;
}

export interface LeaveBancoHorasEntryDto {
  date: string;
  description: string;
  hours: number;
  type: string;
}

export interface LeaveBancoHorasDto {
  balanceHours: number;
  entries: LeaveBancoHorasEntryDto[];
}

export interface LeaveTeamMemberDto {
  name: string;
  role: string;
  absenceType: string;
  startDate: string;
  endDate: string;
}

export interface LeaveTeamCalendarDto {
  members: LeaveTeamMemberDto[];
}

export interface CreateLeaveRequestDto {
  serviceId: string;
  startDate?: string | null;
  endDate?: string | null;
  days?: number | null;
  notes?: string | null;
}

export interface LeaveRequestResultDto {
  requestId: string;
  recordId: string;
  status: string;
  message: string;
}

export type AuditSource = "HttpRequest" | "EntityChange";

export interface AuditEventDto {
  id: string;
  correlationId: string;
  transactionId: string;
  source: AuditSource | number;
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  targetType: string;
  targetId: string;
  httpMethod?: string | null;
  path?: string | null;
  statusCode?: number | null;
  durationMs?: number | null;
  detailsJson?: string | null;
  createdAt: string;
}

export interface AuditEventQueryParams {
  action?: string;
  actorId?: string;
  targetType?: string;
  correlationId?: string;
  source?: AuditSource;
  from?: string;
  to?: string;
  httpStatus?: AuditHttpStatusFilter;
  page?: number;
  pageSize?: number;
}

export interface AuditEventSummaryDto {
  totalCount: number;
  httpCount: number;
  entityCount: number;
  errorCount: number;
  uniqueActors: number;
  uniqueActions: number;
}

export type AuditHttpStatusFilter = "" | "success" | "error";

export interface PagedAuditEventsDto {
  items: AuditEventDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ObservabilitySummaryDto {
  errorsLast24h: number;
  httpErrorRate: number;
  p95LatencyMs?: number | null;
  requestsPerMinute: number;
  dailyActiveUsers: number;
  pageViews: number;
  accessDenied: number;
  authFailures: number;
  topModule?: string | null;
  topPage?: string | null;
  observabilityEvents: number;
  accessEvents: number;
}

export interface ObservabilityEventListItemDto {
  id: string;
  occurredAt: string;
  eventType: string;
  eventName: string;
  severity: number;
  userId?: string | null;
  userName?: string | null;
  correlationId: string;
  routeTemplate?: string | null;
  metadataJson?: string | null;
}

export interface PageViewListItemDto {
  id: string;
  occurredAt: string;
  userId?: string | null;
  userName?: string | null;
  sessionId: string;
  correlationId: string;
  pageName: string;
  routeTemplate: string;
  module: string;
  referrerTemplate?: string | null;
  durationMs?: number | null;
}

export interface AccessEventListItemDto {
  id: string;
  occurredAt: string;
  eventType: string;
  eventName: string;
  userId?: string | null;
  userName?: string | null;
  usernameSnapshot?: string | null;
  correlationId: string;
  resource?: string | null;
  action?: string | null;
  result: string;
  reasonCode?: string | null;
}

export interface PagedObservabilityEventsDto {
  items: ObservabilityEventListItemDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PagedPageViewsDto {
  items: PageViewListItemDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PagedAccessEventsDto {
  items: AccessEventListItemDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ObservabilityMetricPointDto {
  timestamp: string;
  value: number;
}

export interface ObservabilityMetricsDto {
  requestsPerMinute: ObservabilityMetricPointDto[];
  errorRate: ObservabilityMetricPointDto[];
  p95LatencyMs: ObservabilityMetricPointDto[];
}

export interface ObservabilityTimelineItemDto {
  occurredAt: string;
  source: string;
  label: string;
  detail?: string | null;
  referenceId: string;
}

export interface ObservabilityTimelineDto {
  correlationId: string;
  items: ObservabilityTimelineItemDto[];
}

export interface PontoEntryDto {
  date: string;
  weekdayLabel: string;
  clockIn: string;
  lunchOut: string;
  lunchIn: string;
  clockOut: string;
  breakMinutes: string;
  workedHours: string;
  balanceHours: string;
  status: string;
}

export interface PontoSummaryDto {
  periodLabel: string;
  workedHours: string;
  expectedHours: string;
  balanceHours: string;
  absences: number;
  delays: number;
}

export interface PontoResponseDto {
  title: string;
  summary?: PontoSummaryDto | null;
  entries: PontoEntryDto[];
  provider: string;
  isSimulated: boolean;
  availabilityStatus?: string | null;
  userMessage?: string | null;
  dataSource?: string | null;
  syncedAt?: string | null;
}

export interface WorkerDefinitionDto {
  key: string;
  label: string;
  description: string;
  intervalSettingKey?: string | null;
  defaultIntervalMinutes?: number | null;
}

export interface WorkerRunDto {
  id: string;
  workerKey: string;
  status: string;
  triggerSource: string;
  startedAtUtc: string;
  finishedAtUtc?: string | null;
  errorMessage?: string | null;
}

export interface WorkerRunLogDto {
  id: string;
  loggedAtUtc: string;
  level: string;
  message: string;
}

export interface WorkerRunDetailDto {
  run: WorkerRunDto;
  logs: WorkerRunLogDto[];
}

export interface WorkerTriggerResultDto {
  runId: string;
  workerKey: string;
  status: string;
  errorMessage?: string | null;
}

export interface TotvsRmConfigurationDto {
  id: string;
  isEnabled: boolean;
  server: string;
  port: number;
  database: string;
  userName: string;
  hasPassword: boolean;
  trustServerCertificate: boolean;
  timesheetPeriodStartDay: number;
  timesheetPeriodEndDay: number;
  updatedAt: string;
}

export interface UpsertTotvsRmConfigurationRequest {
  isEnabled: boolean;
  server: string;
  port: number;
  database: string;
  userName: string;
  password?: string | null;
  trustServerCertificate: boolean;
  timesheetPeriodStartDay: number;
  timesheetPeriodEndDay: number;
}

export interface PontoPeriodOptionDto {
  endMonth: number;
  endYear: number;
  label: string;
}

export interface PontoPeriodSettingsDto {
  timesheetPeriodStartDay: number;
  timesheetPeriodEndDay: number;
  options: PontoPeriodOptionDto[];
}

export interface TotvsRmConnectionTestResponse {
  success: boolean;
  message: string;
  detail?: string | null;
}
