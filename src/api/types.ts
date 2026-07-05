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
