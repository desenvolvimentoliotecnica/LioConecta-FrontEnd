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

export interface CreateComunicadoRequest {
  kind: ComunicadoKind;
  title: string;
  excerpt?: string | null;
  content?: Record<string, unknown> | null;
  heroImageUrl?: string | null;
  isMandatory: boolean;
  publishedAt?: string | null;
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
