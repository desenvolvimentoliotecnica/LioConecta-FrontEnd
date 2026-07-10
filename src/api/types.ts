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

export type DataScope = "Self" | "Team" | "Department" | "Global" | 0 | 1 | 2 | 3;

export type BusinessArea =
  | "Core"
  | "RH"
  | "Financeiro"
  | "Contabil"
  | "TI"
  | "Facilities"
  | "Juridico"
  | "Marketing"
  | "Pessoas"
  | "Projetos"
  | "Planejamento"
  | "Plataforma"
  | "Analytics"
  | "Quiosque"
  | "UniLio"
  | number;

export type RbacSubjectType = "PortalUser" | "Person" | "TestUser" | 0 | 1 | 2;

export interface EffectivePermissionDto {
  key: string;
  scope: DataScope;
}

export interface MeDto {
  id: string;
  slug: string;
  name: string;
  email: string;
  title?: string | null;
  photoUrl?: string | null;
  departmentName?: string | null;
  roles: Array<UserRole | number>;
  permissions?: EffectivePermissionDto[];
  subjectType?: string | null;
  isTestUser?: boolean;
}

export interface PermissionCatalogItemDto {
  key: string;
  module: string;
  resource: string;
  action: string;
  label: string;
  description: string;
  businessArea: BusinessArea;
  allowedScopes: DataScope[];
  menuPath?: string | null;
}

export interface RoleDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessArea?: BusinessArea | null;
  isSystem: boolean;
  isKeyUserTemplate: boolean;
  isActive: boolean;
  permissionCount: number;
}

export interface RolePermissionDto {
  permissionKey: string;
  dataScope: DataScope;
}

export interface RoleDetailDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  businessArea?: BusinessArea | null;
  isSystem: boolean;
  isKeyUserTemplate: boolean;
  isActive: boolean;
  permissions: RolePermissionDto[];
}

export interface UpsertRoleRequest {
  name: string;
  description?: string | null;
  businessArea?: BusinessArea | null;
}

export interface UpdateRolePermissionsRequest {
  permissions: RolePermissionDto[];
}

export interface SubjectRoleAssignmentDto {
  id: string;
  subjectType: RbacSubjectType;
  subjectId: string;
  subjectLabel: string;
  roleId: string;
  roleName: string;
  assignedAt: string;
}

export interface UpdateSubjectAssignmentsRequest {
  subjectType: RbacSubjectType;
  subjectId: string;
  roleIds: string[];
}

export interface BulkUpdateSubjectAssignmentsRequest {
  items: UpdateSubjectAssignmentsRequest[];
}

export interface RbacSubjectSearchResultDto {
  subjectType: RbacSubjectType;
  subjectId: string;
  label: string;
  subtitle?: string | null;
}

export interface TestUserDto {
  id: string;
  email: string;
  displayName: string;
  businessArea: BusinessArea;
  optionalPersonId?: string | null;
  isActive: boolean;
  expiresAt?: string | null;
  notes?: string | null;
  roleNames: string[];
}

export interface CreateTestUserRequest {
  email: string;
  password: string;
  displayName: string;
  businessArea: BusinessArea;
  optionalPersonId?: string | null;
  expiresAt?: string | null;
  notes?: string | null;
  templateRoleId?: string | null;
}

export interface UpdateTestUserRequest {
  displayName: string;
  businessArea: BusinessArea;
  optionalPersonId?: string | null;
  isActive: boolean;
  expiresAt?: string | null;
  notes?: string | null;
}

export interface ResetTestUserPasswordRequest {
  password: string;
}

export interface RbacBootstrapDto {
  permissions: EffectivePermissionDto[];
  menus: Record<string, string>;
  subjectType?: string | null;
  isTestUser: boolean;
  businessArea?: BusinessArea | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: MeDto;
}

export interface TestLdapConnectionRequest {
  host?: string | null;
  port?: number | null;
  useSsl?: boolean | null;
  bindDn?: string | null;
  bindPassword?: string | null;
  searchBase?: string | null;
}

export interface LdapConnectionTestResponse {
  success: boolean;
  message: string;
  detail?: string | null;
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
export const POST_TYPE_CELEBRATION = 3 as const;

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

export interface BirthdayPersonDto {
  id?: string;
  slug: string;
  name: string;
  title?: string | null;
  departmentName?: string | null;
  birthDate: string;
  photoUrl?: string | null;
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

export interface UploadPostMediaResponseDto {
  url: string;
  contentType: string;
  mediaType: "image" | "video" | string;
  sizeBytes: number;
  originalFileName?: string | null;
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
  availabilityStatus?: string | null;
  userMessage?: string | null;
  dataSource?: string | null;
  syncedAt?: string | null;
  hiredYear?: number | null;
  informeYear?: number | null;
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
  reference?: string | null;
}

export interface PayslipListItemDto {
  year: number;
  month: number;
  competence: string;
  grossAmount: number;
  netAmount: number;
  publishedAt: string;
  paymentType?: string;
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

export interface BenefitManagePolicyDto {
  canManage: boolean;
}

export interface BenefitDepartmentOptionDto {
  id: string;
  name: string;
  count: number;
}

export interface BenefitsBootstrapDto {
  canManage: boolean;
  categories: string[];
  statuses: string[];
  departments: BenefitDepartmentOptionDto[];
  catalogCount: number;
}

export interface BenefitCatalogItemDto {
  id: string;
  catalogKey: string;
  title: string;
  desc: string;
  category: string;
  provider: string;
  status: string;
  featured: boolean;
  isActive: boolean;
  portalUrl?: string | null;
  helpText: string;
  defaultMonthlyValue?: number | null;
  sortOrder: number;
  lines: BenefitDetailLineDto[];
  dependents: BenefitDependentDto[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpsertBenefitCatalogRequest {
  catalogKey: string;
  title: string;
  desc: string;
  category: string;
  provider: string;
  status: string;
  featured: boolean;
  isActive: boolean;
  portalUrl?: string | null;
  helpText: string;
  defaultMonthlyValue?: number | null;
  sortOrder: number;
  lines: BenefitDetailLineDto[];
  dependents: BenefitDependentDto[];
  notes: string[];
}

export interface BenefitManagementListItemDto {
  id: string;
  personId: string;
  personName: string;
  departmentName?: string | null;
  benefitKey: string;
  title: string;
  category: string;
  provider: string;
  status: string;
  isActive: boolean;
  monthlyValue?: number | null;
  updatedAt: string;
}

export interface BenefitEmployeeDetailDto {
  id: string;
  personId: string;
  personName: string;
  departmentName?: string | null;
  benefitKey: string;
  title: string;
  desc: string;
  category: string;
  provider: string;
  status: string;
  featured: boolean;
  isActive: boolean;
  portalUrl?: string | null;
  helpText: string;
  monthlyValue?: number | null;
  lines: BenefitDetailLineDto[];
  dependents: BenefitDependentDto[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpsertEmployeeBenefitRequest {
  personId: string;
  benefitKey: string;
  title: string;
  desc: string;
  category: string;
  provider: string;
  status: string;
  featured: boolean;
  isActive: boolean;
  portalUrl?: string | null;
  helpText: string;
  monthlyValue?: number | null;
  lines?: BenefitDetailLineDto[] | null;
  dependents?: BenefitDependentDto[] | null;
  notes?: string[] | null;
}

export interface BenefitAssignmentOverridesDto {
  monthlyValue?: number | null;
  isActive?: boolean | null;
  lines?: BenefitDetailLineDto[] | null;
  dependents?: BenefitDependentDto[] | null;
  notes?: string[] | null;
}

export interface AssignBenefitFromCatalogRequest {
  personId: string;
  catalogKey: string;
  overrides?: BenefitAssignmentOverridesDto | null;
}

export interface BulkBenefitTargetRequest {
  personIds?: string[] | null;
  departmentIds?: string[] | null;
  excludePersonIds?: string[] | null;
}

export interface BulkAssignBenefitsRequest {
  target: BulkBenefitTargetRequest;
  catalogKey: string;
  overrides?: BenefitAssignmentOverridesDto | null;
  onDuplicate?: string | null;
}

export interface BulkSetActiveBenefitsRequest {
  target: BulkBenefitTargetRequest;
  catalogKey?: string | null;
  isActive: boolean;
}

export interface BulkBenefitOperationErrorDto {
  personId: string;
  message: string;
}

export interface BulkBenefitOperationResultDto {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: BulkBenefitOperationErrorDto[];
}

export interface BulkBenefitPreviewPersonDto {
  id: string;
  name: string;
}

export interface BulkBenefitPreviewDto {
  targetPeopleCount: number;
  matchingBenefitsCount: number;
  wouldCreate: number;
  wouldUpdate: number;
  wouldSkip: number;
  samplePeople: BulkBenefitPreviewPersonDto[];
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
  files?: File[];
}

export interface LeaveRequestResultDto {
  requestId: string;
  recordId: string;
  status: string;
  message: string;
  protocol: string;
}

export interface LeaveRequestItemDto {
  id: string;
  serviceRequestId?: string | null;
  title: string;
  status: string;
  rmSyncStatus?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  days?: number | null;
  dataSource?: string | null;
  createdAt: string;
}

export interface LeaveTimelineEventDto {
  label: string;
  status: string;
  occurredAt: string;
  detail?: string | null;
}

export interface LeaveRequestDetailDto {
  id: string;
  serviceRequestId?: string | null;
  title: string;
  status: string;
  rmSyncStatus?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  days?: number | null;
  notes?: string | null;
  dataSource?: string | null;
  createdAt: string;
  timeline: LeaveTimelineEventDto[];
}

export interface LeaveManagementItemDto {
  id: string;
  serviceRequestId?: string | null;
  employeeName: string;
  employeeId?: string | null;
  email: string;
  title: string;
  status: string;
  rmSyncStatus?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  days?: number | null;
  dataSource?: string | null;
  createdAt: string;
}

export interface LeaveManagementDetailDto {
  id: string;
  serviceRequestId?: string | null;
  employeeName: string;
  employeeId?: string | null;
  email: string;
  title: string;
  status: string;
  rmSyncStatus?: string | null;
  rmExternalId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  days?: number | null;
  notes?: string | null;
  dataSource?: string | null;
  createdAt: string;
  timeline: LeaveTimelineEventDto[];
  approvalNote: string;
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

export interface TestGraphConnectionRequest {
  tenantId?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
}

export interface GraphConnectionTestResponse {
  success: boolean;
  message: string;
  detail?: string | null;
  usesDevAdapters: boolean;
  domainUserCount?: number | null;
  tenantUserCount?: number | null;
}

export interface PlannerAssigneeDto {
  id: string;
  name: string;
  email: string;
}

export interface PlannerChecklistItemDto {
  id: string;
  text: string;
  done: boolean;
}

export interface PlannerTaskDto {
  id: string;
  title: string;
  description: string;
  startDate: string | null;
  dueDate: string | null;
  percentComplete: number;
  bucketId: string;
  bucketName: string;
  assignees: PlannerAssigneeDto[];
  checklist: PlannerChecklistItemDto[];
  isOwnedByCurrentUser: boolean;
  canEdit: boolean;
  plannerUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlannerTasksResponseDto {
  tasks: PlannerTaskDto[];
  usesDevAdapters: boolean;
  plannerEnabled: boolean;
  planTitle?: string | null;
}

export interface PlannerBucketDto {
  id: string;
  name: string;
  orderHint: number;
}

export interface CreatePlannerTaskRequest {
  title: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  percentComplete: number;
  bucketId?: string | null;
  checklist?: PlannerChecklistItemDto[] | null;
}

export interface UpdatePlannerTaskRequest {
  title: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  percentComplete: number;
  bucketId?: string | null;
  checklist?: PlannerChecklistItemDto[] | null;
}

export interface TestPlannerConnectionRequest {
  planId?: string | null;
}

export interface PlannerConnectionTestResponse {
  success: boolean;
  message: string;
  detail?: string | null;
  usesDevAdapters: boolean;
  plannerEnabled: boolean;
  planId?: string | null;
  planTitle?: string | null;
  bucketCount?: number | null;
  taskCount?: number | null;
}

export interface TestGlpiConnectionRequest {
  baseUrl?: string | null;
  appToken?: string | null;
  userToken?: string | null;
}

export interface GlpiConnectionTestResponse {
  success: boolean;
  message: string;
  detail?: string | null;
  usesDevAdapters: boolean;
}

export interface EmailConfigurationDto {
  id: string;
  isEnabled: boolean;
  fromAddress: string;
  fromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  hasPassword: boolean;
  useStartTls: boolean;
  timeoutSeconds: number;
  maxAttempts: number;
  initialRetryDelaySeconds: number;
  maxRetryDelaySeconds: number;
  dispatchBatchSize: number;
  dispatchIntervalSeconds: number;
  updatedAt: string;
}

export interface UpsertEmailConfigurationRequest {
  isEnabled: boolean;
  fromAddress: string;
  fromName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword?: string | null;
  useStartTls: boolean;
  timeoutSeconds: number;
  maxAttempts: number;
  initialRetryDelaySeconds: number;
  maxRetryDelaySeconds: number;
  dispatchBatchSize: number;
  dispatchIntervalSeconds: number;
}

export interface EmailSmtpTestRequest extends UpsertEmailConfigurationRequest {
  testRecipient?: string | null;
}

export interface EmailConnectionTestResponse {
  success: boolean;
  message: string;
  detail?: string | null;
}

export interface EmailMessageDto {
  id: string;
  status: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml?: string | null;
  bodyText?: string | null;
  templateKey?: string | null;
  metadataJson?: string | null;
  priority: number;
  idempotencyKey?: string | null;
  correlationId?: string | null;
  attemptCount: number;
  maxAttempts: number;
  lastError?: string | null;
  providerMessageId?: string | null;
  scheduledAt: string;
  nextRetryAt?: string | null;
  processingStartedAt?: string | null;
  sentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailMessageSummaryDto {
  pending: number;
  processing: number;
  sent: number;
  failed: number;
  cancelled: number;
  sentLast24Hours: number;
  failedLast24Hours: number;
  successRateLast24Hours: number;
}

export interface PagedEmailMessagesDto {
  items: EmailMessageDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface EmailRecipient {
  name?: string | null;
  email: string;
}

export interface EmailAttachmentUploadDto {
  id: string;
  fileName: string;
  sizeBytes: number;
  contentType: string;
}

export interface SendEmailRequest {
  to?: string[] | null;
  recipientSlug?: string | null;
  subject: string;
  bodyHtml?: string | null;
  cc?: string[] | null;
  bcc?: string[] | null;
  attachmentIds?: string[] | null;
  source?: string | null;
}

export interface SendEmailResponse {
  messageId: string;
  status: string;
}

export type EmailComposeOpenOptions = {
  to?: EmailRecipient[];
  recipientSlug?: string;
  cc?: string[];
  bcc?: string[];
  subject?: string;
  bodyHtml?: string;
  lockedTo?: boolean;
  showBcc?: boolean;
  showExternalMailtoLink?: boolean;
  source?: string;
};

// --- Help Desk / Service Requests ---

export type ServiceRequestStatus =
  | "Draft"
  | "Submitted"
  | "InReview"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Cancelled";

export type ServiceCategory = "RH" | "Financeiro" | "TI" | "Facilities" | "Juridico";

export interface ServiceRequestEventDto {
  id: string;
  eventType: string;
  actor?: PersonSummaryDto | null;
  createdAt: string;
  details?: Record<string, unknown> | null;
}

export interface ServiceRequestDto {
  id: string;
  type: string;
  category: ServiceCategory;
  status: ServiceRequestStatus;
  requester: PersonSummaryDto;
  payload: Record<string, unknown>;
  assigneeTeam?: string | null;
  externalRef?: string | null;
  createdAt: string;
  updatedAt: string;
  events: ServiceRequestEventDto[];
}

export interface CreateServiceRequestRequestDto {
  type: string;
  category: ServiceCategory;
  payload: Record<string, unknown>;
}

export interface HelpDeskSummaryDto {
  openTickets: number;
  avgResponseLabel: string;
  canViewAllTickets?: boolean;
}

export interface HelpDeskServiceDto {
  id: string;
  title: string;
  desc: string;
  category: string;
  provider: string;
  status: string;
  featured: boolean;
  action: string;
  helpText: string;
  portalUrl?: string | null;
}

export interface HelpDeskKnowledgeArticleDto {
  id: string;
  title: string;
  summary: string;
  category: string;
  updatedAt: string;
  url: string;
}

export interface HelpDeskAreaDto {
  id: string;
  name: string;
  icon: string;
  serviceCount: number;
  entityId: number;
}

export interface CreateHelpDeskTicketRequestDto {
  subject: string;
  priority: string;
  entityId: number;
  categoryId: number;
  description: string;
}

export interface HelpDeskGlpiEntityDto {
  id: number;
  name: string;
  fullName?: string | null;
  parentId?: number | null;
  hasChildren: boolean;
}

export interface HelpDeskItilCategoryDto {
  id: number;
  name: string;
  fullName?: string | null;
  parentId?: number | null;
  hasChildren: boolean;
  entityId: number;
}

export interface HelpDeskTicketResultDto {
  requestId: string;
  status: string;
  message: string;
  externalRef?: string | null;
  externalUrl?: string | null;
}

export interface HelpDeskTicketListItemDto {
  ticketId: string;
  subject: string;
  status: string;
  statusLabel: string;
  priorityLabel: string;
  createdAt: string;
  externalUrl?: string | null;
  requesterLabel?: string | null;
}

export interface HelpDeskTicketEventDto {
  eventType: string;
  createdAt: string;
  author?: string | null;
}

export interface HelpDeskTicketDetailDto {
  summary: HelpDeskTicketListItemDto;
  description: string;
  assignee?: string | null;
  events: HelpDeskTicketEventDto[];
}

export type OrgPositionSource = "graph" | "manual";

export interface OrgChartSettingsDto {
  governanceEnabled: boolean;
  editAllowedRoles: UserRole[];
  editAllowedEmails: string[];
  viewFullAllowedRoles: UserRole[];
  allowDisplayNameEdit: boolean;
  allowReimport: boolean;
  showOverrideBadge: boolean;
  updatedAt: string;
  updatedById?: string | null;
}

export interface UpsertOrgChartSettingsRequest {
  governanceEnabled: boolean;
  editAllowedRoles: UserRole[];
  editAllowedEmails: string[];
  viewFullAllowedRoles: UserRole[];
  allowDisplayNameEdit: boolean;
  allowReimport: boolean;
  showOverrideBadge: boolean;
}

export interface OrgChartPolicyDto {
  canEdit: boolean;
  canImport: boolean;
  canManageDepartments: boolean;
  canViewFull: boolean;
  allowedFields: string[];
  governanceEnabled: boolean;
}

export interface GovernedOrgChartNodeDto {
  id: string;
  orgChartId?: string | null;
  slug: string;
  name: string;
  title?: string | null;
  photoUrl?: string | null;
  departmentName?: string | null;
  managerId?: string | null;
  tags: string[];
  isOrphan: boolean;
  email?: string | null;
  teamsUpn?: string | null;
  phone?: string | null;
  location?: string | null;
  hireDate?: string | null;
  positionId: string;
  hasManualOverride: boolean;
  graphTitle?: string | null;
  graphDepartmentName?: string | null;
  graphManagerName?: string | null;
  orgDepartmentId?: string | null;
  managerPositionId?: string | null;
  managerName?: string | null;
  isVisible?: boolean;
}

export interface GovernedOrgChartDto {
  nodes: GovernedOrgChartNodeDto[];
  rootId?: string | null;
  total: number;
  rootIds: string[];
  orphanCount: number;
  syncedAtUtc?: string | null;
  unassignedNodes: GovernedOrgChartNodeDto[];
  unassignedCount: number;
}

export interface OrgDepartmentDto {
  id: string;
  name: string;
  parentDepartmentId?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface UpsertOrgDepartmentRequest {
  name: string;
  parentDepartmentId?: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface OrgPositionDto {
  id: string;
  personId: string;
  personName: string;
  title?: string | null;
  departmentName?: string | null;
  orgDepartmentId?: string | null;
  managerPositionId?: string | null;
  managerName?: string | null;
  isVisible: boolean;
  sortOrder: number;
  hasManualOverride: boolean;
  source: OrgPositionSource;
  graphTitle?: string | null;
  graphDepartmentName?: string | null;
  updatedAt: string;
}

export interface UpsertOrgPositionRequest {
  title?: string | null;
  departmentName?: string | null;
  orgDepartmentId?: string | null;
  managerPositionId?: string | null;
  isVisible?: boolean | null;
  sortOrder?: number | null;
  displayName?: string | null;
}

export interface CreateOrgPositionRequest {
  personId: string;
  title?: string | null;
  departmentName?: string | null;
  orgDepartmentId?: string | null;
  managerPositionId?: string | null;
  isVisible?: boolean;
  sortOrder?: number;
}

export interface OrgChartGovernanceSummaryDto {
  totalPositions: number;
  visiblePositions: number;
  manualOverrides: number;
  totalDepartments: number;
  activeDepartments: number;
  lastImportAt?: string | null;
}

export interface ImportFromGraphRequest {
  force: boolean;
}

export type ImportFromGraphResultDto = OrgChartGovernanceSummaryDto;

export interface OrgDepartmentMappingDto {
  id: string;
  sourceName: string;
  orgDepartmentId?: string | null;
  orgDepartmentName?: string | null;
  employeeCount: number;
  isActive: boolean;
}

export interface UpsertOrgDepartmentMappingRequest {
  orgDepartmentId?: string | null;
  isActive?: boolean | null;
  updateOrgDepartmentId?: boolean;
}

export interface ImportDepartmentsFromDirectoryRequest {
  createMissingDepartments?: boolean;
}

export interface ImportDepartmentsFromDirectoryResultDto {
  mappingsImported: number;
  departmentsCreated: number;
  departmentsLinked: number;
  unmappedCount: number;
}

export interface OrgDepartmentMappingDto {
  id: string;
  sourceName: string;
  orgDepartmentId?: string | null;
  orgDepartmentName?: string | null;
  employeeCount: number;
  isActive: boolean;
}

export interface UpsertOrgDepartmentMappingRequest {
  orgDepartmentId?: string | null;
  isActive?: boolean | null;
  updateOrgDepartmentId?: boolean;
}

export interface ImportDepartmentsFromDirectoryRequest {
  createMissingDepartments?: boolean;
}

export interface ImportDepartmentsFromDirectoryResultDto {
  mappingsImported: number;
  departmentsCreated: number;
  departmentsLinked: number;
  unmappedCount: number;
}

export interface ChatBootstrapDto {
  enabled: boolean;
  authMode: string;
  delegatedScopes: string[];
  includeGroupChats: boolean;
  pollingIntervalSeconds: number;
  signalREnabled: boolean;
  msalClientId: string;
  msalTenantId: string;
  msalAuthority: string;
}

export interface LoopBootstrapDto {
  enabled: boolean;
  allowedRoles: UserRole[];
  allowedEmails: string[];
}

export interface CompassBootstrapDto {
  enabled: boolean;
  allowedRoles: UserRole[];
  allowedEmails: string[];
}

export interface CompassSnapshotDto {
  id: string;
  name: string;
  source: string;
  exportedAt: string;
  fiscalYear: number;
  periodLabel: string;
  hyperionVersion?: string | null;
}

export interface CompassDimensionOptionDto {
  value: string;
  label: string;
  count?: number | null;
}

export interface CompassMetaDto {
  snapshot: CompassSnapshotDto;
  hyperionBadge?: string | null;
  directorias: CompassDimensionOptionDto[];
  unidades: CompassDimensionOptionDto[];
  familias: CompassDimensionOptionDto[];
  tipos: CompassDimensionOptionDto[];
}

export interface CompassKpiDto {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  mod: string;
  href?: string | null;
}

export interface CompassAlertDto {
  id: string;
  type?: string;
  severity: string;
  title: string;
  description: string;
  quantity: number;
  date?: string;
  origin?: string;
  link: string;
}

export interface CompassDashboardGapDto {
  id: string;
  title: string;
  severity: "critico" | "alto" | "medio" | "baixo";
  diretoria: string;
  tipo: string;
  value: string;
  variacaoPct: number;
}

export interface CompassDashboardMeetingDto {
  id: string;
  date: string;
  time: string;
  title: string;
  phaseLabel: string;
}

export interface CompassDashboardDecisionDto {
  id: string;
  title: string;
  meetingTitle: string;
  ownerName: string;
  dueDate: string;
  impact: string;
  status: string;
}

export interface CompassReconciliationCellDto {
  diretoria: string;
  tipo: string;
  ibpAtual: number;
  ibpAnterior: number;
  variacao: number;
  variacaoPct: number;
}

export interface CompassAggregateRowDto {
  groupKey: string;
  groupLabel: string;
  ibpAtual: number;
  ibpAnterior: number;
  variacao: number;
  variacaoPct: number;
  rowCount?: number;
}

export type CompassAggregateGroupBy = "diretoria" | "familia" | "tipo" | "unidade" | "matriz";

export interface CompassAggregatesDto {
  groupBy: CompassAggregateGroupBy;
  rows: CompassAggregateRowDto[];
  totals: {
    ibpAtual: number;
    ibpAnterior: number;
    variacao: number;
    variacaoPct: number;
  };
}

export interface CompassDashboardDto {
  snapshot: CompassSnapshotDto;
  currentPhaseLabel: string;
  cycleProgress: number;
  alignmentIndex: number;
  alignmentDelta: number;
  kpis: CompassKpiDto[];
  alerts: CompassAlertDto[];
  alignmentHistory: { label: string; value: number }[];
  demandSupplyChart: { label: string; demand: number; supply: number }[];
  varianceBridge: { label: string; value: number; color: string }[];
  topGaps: CompassDashboardGapDto[];
  upcomingMeetings: CompassDashboardMeetingDto[];
  recentDecisions: CompassDashboardDecisionDto[];
  reconciliationMatrix: CompassReconciliationCellDto[];
  summaryByTipo: CompassAggregateRowDto[];
  summaryByDiretoria: CompassAggregateRowDto[];
}

export interface CompassYtdRowDto {
  id: string;
  diretoria: string;
  unidade: string;
  familia: string;
  tipo: string;
  matriz: string;
  conta: string;
  ibpAtual: number;
  ibpAnterior: number;
  variacao: number;
  variacaoPct: number;
  moeda: string;
}

export interface CompassYtdPageDto {
  items: CompassYtdRowDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  totals: {
    ibpAtual: number;
    ibpAnterior: number;
    variacao: number;
    variacaoPct: number;
  };
}

export interface ChatStatusDto {
  enabled: boolean;
  linked: boolean;
  needsConsent: boolean;
}

export interface ChatAuthorDto {
  id: string;
  displayName: string;
  email?: string | null;
  photoUrl?: string | null;
}

export interface ChatConversationDto {
  id: string;
  title: string;
  chatType: string;
  lastMessageAuthor?: string | null;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  participants: ChatAuthorDto[];
}

export interface ChatMessageDto {
  id: string;
  author: ChatAuthorDto;
  text: string;
  createdAt: string;
}

export interface LinkTeamsAccountRequest {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scopes: string[];
}

export interface CreateChatConversationRequest {
  targetEmail: string;
}

export interface SendMessageRequest {
  text: string;
}

export interface TestChatConnectionRequest {
  tenantId?: string | null;
  clientId?: string | null;
  clientSecret?: string | null;
}

export interface ChatConnectionTestResponse {
  success: boolean;
  message: string;
  detail?: string | null;
}

export interface CalendarBootstrapDto {
  enabled: boolean;
  delegatedScopes: string[];
  defaultView: string;
  showBirthdays: boolean;
  showCafeteriaMenu: boolean;
  msalClientId: string;
  msalTenantId: string;
  msalAuthority: string;
}

export interface CalendarStatusDto {
  enabled: boolean;
  linked: boolean;
  needsConsent: boolean;
}

export interface CalendarListItemDto {
  id: string;
  name: string;
  color?: string | null;
  canEdit: boolean;
  isDefaultCalendar: boolean;
}

export interface CalendarEventDto {
  graphId: string;
  calendarId: string;
  title: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  location?: string | null;
  description?: string | null;
  onlineMeetingUrl?: string | null;
  webLink?: string | null;
  organizerName?: string | null;
  organizerEmail?: string | null;
  source: string;
  color?: string | null;
  canEdit: boolean;
}

export interface MenuSectionDto {
  key: string;
  label: string;
  value: string;
}

export type MenuMealType = "breakfast" | "lunch" | "afternoon_coffee" | "dinner" | "shift";

export type MenuDayStatus = "normal" | "holiday" | "closed";

export interface MealMenuDto {
  mealType: MenuMealType;
  sections: MenuSectionDto[];
}

export interface DailyMenuDto {
  date: string;
  dayStatus: MenuDayStatus;
  dayStatusLabel?: string | null;
  meals: MealMenuDto[];
  notes?: string | null;
  published: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface WeeklyMenuDto {
  weekStart: string;
  days: DailyMenuDto[];
}

export interface MenuEditorSettingsDto {
  allowedEmails: string[];
  allowedRoles: UserRole[];
  emailRecipients: string[];
}

export interface MenuEditorBootstrapDto {
  canEdit: boolean;
  templates: {
    lunchSections: Array<{ key: string; label: string }>;
    mealTypes: MenuMealType[];
  };
}

export interface SaveDailyMenuRequest {
  dayStatus?: MenuDayStatus;
  dayStatusLabel?: string | null;
  meals: MealMenuDto[];
  notes?: string | null;
  published?: boolean;
}

export interface CopyMenuDayRequest {
  sourceDate: string;
}

export interface CopyMenuWeekRequest {
  sourceWeekStart: string;
}

export interface SendMenuEmailRequest {
  weekStart: string;
  recipients?: string[];
  includePdf?: boolean;
}

export interface SendMenuEmailResponse {
  success: boolean;
  message: string;
  recipientCount: number;
}

/** @deprecated Use DailyMenuDto — kept as alias for calendar hooks */
export type CafeteriaMenuDto = DailyMenuDto;

export interface LinkCalendarAccountRequest {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scopes: string[];
}

export interface CreateCalendarEventRequest {
  calendarId: string;
  title: string;
  startAt: string;
  endAt: string;
  isAllDay: boolean;
  location?: string | null;
  description?: string | null;
}

export interface UpdateCalendarEventRequest {
  title?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  isAllDay?: boolean | null;
  location?: string | null;
  description?: string | null;
}

export interface TestCalendarConnectionRequest {
  tokenEncryptionKey?: string | null;
}

export interface CalendarConnectionTestResponse {
  success: boolean;
  message: string;
  detail?: string | null;
  calendarEnabled: boolean;
  tenantId?: string | null;
  clientId?: string | null;
}

export interface PhoneExtensionDto {
  id: string;
  name: string;
  extension: string;
  mobile?: string | null;
  department: string;
  title?: string | null;
  email?: string | null;
  managerName?: string | null;
  personId?: string | null;
  personSlug?: string | null;
  personName?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PhoneExtensionsBootstrapDto {
  canManage: boolean;
  total: number;
  departments: string[];
}

export interface UpsertPhoneExtensionRequest {
  name: string;
  extension: string;
  mobile?: string | null;
  department: string;
  title?: string | null;
  email?: string | null;
  managerName?: string | null;
  personId?: string | null;
  isActive?: boolean;
}

export interface PortalSystemDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  destinationType: "External" | "Internal" | string;
  urlDev?: string | null;
  urlHml?: string | null;
  urlPrd?: string | null;
  launchUrl?: string | null;
  iconKind: "FontAwesome" | "Upload" | string;
  iconFaClass?: string | null;
  iconAssetUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  accessNotes?: string | null;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemsBootstrapDto {
  canManage: boolean;
  environment: "dev" | "hml" | "prd" | string;
  total: number;
  categories: string[];
}

export interface UpsertPortalSystemRequest {
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  destinationType: string;
  urlDev?: string | null;
  urlHml?: string | null;
  urlPrd?: string | null;
  iconKind: string;
  iconFaClass?: string | null;
  iconAssetUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  accessNotes?: string | null;
}

export interface UploadSystemIconResponseDto {
  url: string;
  contentType: string;
  sizeBytes: number;
  originalFileName?: string | null;
}

// ── UniLio (LMS) ─────────────────────────────────────────────────────────────

export interface UniLioBootstrapDto {
  enabled: boolean;
  canAccess: boolean;
  allowedRoles: UserRole[];
  allowedEmails: string[];
}

export interface UniLioMetaDto {
  persona: string;
  areas: string[];
  departments: string[];
  contentTypes: string[];
  skills: string[];
}

export interface UniLioKpiDto {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: string;
  icon: string;
}

export interface UniLioIntegrationLinkDto {
  sourceType: string;
  sourceKey: string;
  label: string;
}

export interface UniLioCourseSummaryDto {
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
  integrations: UniLioIntegrationLinkDto[];
  enrolledCount: number;
  completedCount: number;
}

export interface UniLioCourseEnrollmentRecordDto {
  personId: string;
  personName: string;
  status: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface UniLioCourseEnrollmentsDto {
  courseId: string;
  enrolledCount: number;
  completedCount: number;
  items: UniLioCourseEnrollmentRecordDto[];
}

export interface UniLioCourseStartDto {
  courseId: string;
  enrollmentStatus: string;
  startedAt: string;
}

export interface UniLioModuleAttachmentDto {
  id: string;
  fileName: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  sortOrder: number;
}

export interface UniLioModuleDto {
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
  attachments: UniLioModuleAttachmentDto[];
}

export interface UniLioCourseDetailDto extends UniLioCourseSummaryDto {
  progressPct: number;
  enrollmentStatus: string;
  modules: UniLioModuleDto[];
}

export interface UniLioPathSummaryDto {
  id: string;
  seedKey: string;
  title: string;
  description: string;
  courseCount: number;
  progressPct: number;
  completedCourses: number;
}

export interface UniLioPathDetailDto extends UniLioPathSummaryDto {
  courses: UniLioCourseSummaryDto[];
}

export interface UniLioAlertDto {
  id: string;
  severity: string;
  title: string;
  description: string;
  link: string;
}

export interface UniLioRecommendationDto {
  courseId: string;
  title: string;
  reason: string;
  area: string;
  durationMinutes: number;
  contentType: string;
  thumbnailUrl?: string | null;
}

export interface UniLioDashboardDto {
  kpis: UniLioKpiDto[];
  activePath: UniLioPathSummaryDto | null;
  alerts: UniLioAlertDto[];
  nextSteps: UniLioCourseSummaryDto[];
  topRecommendations: UniLioRecommendationDto[];
}

export interface UniLioCatalogPageDto {
  items: UniLioCourseSummaryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UniLioPathsDto {
  items: UniLioPathSummaryDto[];
}

export interface UniLioProgressDto {
  courseId: string;
  progressPct: number;
  status: string;
  courseCompleted: boolean;
}

export interface UniLioCompleteModuleRequest {
  contentRating?: number | null;
  feedbackComment?: string | null;
}

export interface UniLioAssessmentSummaryDto {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  passingScore: number;
  lastScore?: number | null;
  lastPassed?: boolean | null;
  lastAttemptedAt?: string | null;
  status: string;
}

export interface UniLioAssessmentsDto {
  pending: UniLioAssessmentSummaryDto[];
  history: UniLioAssessmentSummaryDto[];
}

export interface UniLioAssessmentSubmitRequest {
  answers: Record<string, string>;
}

export interface UniLioAssessmentResultDto {
  attemptId: string;
  score: number;
  passed: boolean;
  certificateIssued: boolean;
  certificateCode?: string | null;
}

export interface UniLioCertificateDto {
  id: string;
  courseId: string;
  courseTitle: string;
  certificateCode: string;
  issuedAt: string;
  area: string;
}

export interface UniLioCertificatesDto {
  items: UniLioCertificateDto[];
}

export interface UniLioComplianceItemDto {
  courseId: string;
  title: string;
  area: string;
  progressPct: number;
  status: string;
  dueDate?: string | null;
  isOverdue: boolean;
}

export interface UniLioComplianceDto {
  items: UniLioComplianceItemDto[];
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface UniLioCommunityPostDto {
  id: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  courseTitle?: string | null;
  body: string;
  likesCount: number;
  createdAt: string;
}

export interface UniLioCommunityPageDto {
  items: UniLioCommunityPostDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface UniLioRecommendationsDto {
  items: UniLioRecommendationDto[];
}

export interface UniLioEventDto {
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
}

export interface UniLioEventsDto {
  items: UniLioEventDto[];
}

export interface UniLioSkillLevelDto {
  skillId: string;
  name: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  relatedCourseTitles: string[];
}

export interface UniLioSkillsDto {
  items: UniLioSkillLevelDto[];
}

export interface UniLioTeamMemberDto {
  personId: string;
  name: string;
  department: string;
  enrolledCount: number;
  completedCount: number;
  mandatoryPending: number;
  avgProgressPct: number;
}

export interface UniLioManagerTeamDto {
  members: UniLioTeamMemberDto[];
  totalMembers: number;
  avgCompletionPct: number;
}

export interface UniLioInstructorCourseDto {
  courseId: string;
  title: string;
  area: string;
  enrolledCount: number;
  completedCount: number;
  avgRating: number;
  status: string;
  publishedAt?: string | null;
}

export interface UniLioInstructorCoursesDto {
  items: UniLioInstructorCourseDto[];
}

export interface UniLioReportMetricDto {
  label: string;
  value: string;
  delta: string;
}

export interface UniLioReportsDto {
  metrics: UniLioReportMetricDto[];
  topCourses: UniLioCourseSummaryDto[];
  complianceGaps: UniLioComplianceItemDto[];
}

export interface UniLioQuestionQuery {
  courseId?: string | null;
  status?: string | null;
  unreadOnly?: boolean | null;
  page?: number;
  pageSize?: number;
}

export interface CreateUniLioQuestionRequest {
  body: string;
  visibility?: string;
  moduleId?: string | null;
}

export interface ReplyUniLioQuestionRequest {
  body: string;
}

export interface UniLioQuestionReplyDto {
  id: string;
  authorName: string;
  isInstructorReply: boolean;
  body: string;
  createdAt: string;
}

export interface UniLioQuestionSummaryDto {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string | null;
  moduleTitle?: string | null;
  moduleSortOrder?: number | null;
  authorPersonId: string;
  authorName: string;
  body: string;
  visibility: string;
  status: string;
  unread: boolean;
  createdAt: string;
  replyCount: number;
  lastInstructorReply?: string | null;
  lastInstructorReplyAt?: string | null;
}

export interface UniLioQuestionDetailDto {
  id: string;
  courseId: string;
  courseTitle: string;
  moduleId?: string | null;
  moduleTitle?: string | null;
  moduleSortOrder?: number | null;
  authorPersonId: string;
  authorName: string;
  body: string;
  visibility: string;
  status: string;
  unread: boolean;
  createdAt: string;
  replies: UniLioQuestionReplyDto[];
}

export interface UniLioQuestionsPageDto {
  items: UniLioQuestionSummaryDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  unreadCount: number;
  openCount?: number;
}
