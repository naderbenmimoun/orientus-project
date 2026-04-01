export type ConversationStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'CLOSED';
export type MessageType = 'TEXT' | 'SYSTEM';
export type SenderRole = 'STUDENT' | 'ADMIN' | 'OWNER';

export interface ConversationDTO {
  id: number;
  subject: string;
  status: ConversationStatus;
  studentName: string;
  studentId: number;
  adminName: string | null;
  adminId: number | null;
  initialMessageCount: number;
  createdAt: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface MessageDTO {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderRole: SenderRole;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  createdAt: string;
}

export interface CreateConversationRequest {
  subject: string;
  firstMessage: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
