import { resolvePersonAvatarSrc } from "../../utils/personAvatar";
import type { ChatConversationDto, ChatMessageDto } from "../../api/types";
import type { ChatConversation, ChatMessage } from "./chatTypes";

function resolveAvatar(participants: ChatConversationDto["participants"]): string | null {
  for (const participant of participants) {
    const src = resolvePersonAvatarSrc(participant.photoUrl);
    if (src) return src;
  }
  return null;
}

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatConversationDate(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date
    .toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
    .toUpperCase();
}

function isPriorityChat(chatType: string): boolean {
  const normalized = chatType.toLowerCase();
  return normalized === "oneonone" || normalized === "one_on_one" || normalized === "direct";
}

export function mapConversationDto(dto: ChatConversationDto): ChatConversation {
  return {
    id: dto.id,
    name: dto.title,
    avatar: resolveAvatar(dto.participants),
    lastMessage: dto.lastMessagePreview ?? "",
    lastMessageDate: formatConversationDate(dto.lastMessageAt),
    unreadCount: dto.unreadCount,
    priority: isPriorityChat(dto.chatType),
    chatType: dto.chatType,
    participantEmails: dto.participants
      .map((p) => p.email)
      .filter((email): email is string => Boolean(email)),
  };
}

export function mapMessageDto(dto: ChatMessageDto): ChatMessage {
  const createdAt = dto.createdAt;
  return {
    id: dto.id,
    senderId: dto.author.id,
    text: dto.text,
    timestamp: formatMessageTime(createdAt),
    dateLabel: formatDateLabel(createdAt),
    authorDisplayName: dto.author.displayName,
    authorPhotoUrl: resolvePersonAvatarSrc(dto.author.photoUrl),
  };
}

export function mapMessageDtos(dtos: ChatMessageDto[]): ChatMessage[] {
  return dtos.map((dto) => mapMessageDto(dto));
}
