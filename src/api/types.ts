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
  roles: UserRole[];
}

export interface PagedResult<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface NotificationDto {
  id: string;
  type: string;
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
