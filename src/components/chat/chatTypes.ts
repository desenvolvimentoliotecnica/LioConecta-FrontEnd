export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  dateLabel?: string;
  authorDisplayName?: string;
  authorPhotoUrl?: string | null;
};

export type ChatConversation = {
  id: string;
  name: string;
  avatar: string | null;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  priority: boolean;
  chatType: string;
  participantEmails: string[];
};
