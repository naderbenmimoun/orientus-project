import axios from 'axios';
import type {
  ConversationDTO,
  MessageDTO,
  CreateConversationRequest,
  SendMessageRequest,
  UnreadCountResponse,
} from '../models/Message';

const API_BASE_URL = 'http://localhost:8084/api';
const TOKEN_KEY = 'orientus_token';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const messageService = {
  // ─── Conversations ────────────────────────────────────────

  createConversation: async (
    studentId: number,
    data: CreateConversationRequest
  ): Promise<ConversationDTO> => {
    const res = await axiosInstance.post<ConversationDTO>(
      `/messages/conversations?studentId=${studentId}`,
      data
    );
    return res.data;
  },

  getStudentConversations: async (
    studentId: number
  ): Promise<ConversationDTO[]> => {
    const res = await axiosInstance.get<ConversationDTO[]>(
      `/messages/conversations/student/${studentId}`
    );
    return res.data;
  },

  getStudentUnreadCount: async (
    studentId: number
  ): Promise<UnreadCountResponse> => {
    const res = await axiosInstance.get<UnreadCountResponse>(
      `/messages/conversations/student/${studentId}/unread`
    );
    return res.data;
  },

  getPendingConversations: async (): Promise<ConversationDTO[]> => {
    const res = await axiosInstance.get<ConversationDTO[]>(
      `/messages/conversations/pending`
    );
    return res.data;
  },

  getAdminConversations: async (
    adminId: number
  ): Promise<ConversationDTO[]> => {
    const res = await axiosInstance.get<ConversationDTO[]>(
      `/messages/conversations/admin/${adminId}`
    );
    return res.data;
  },

  getAllConversations: async (): Promise<ConversationDTO[]> => {
    const res = await axiosInstance.get<ConversationDTO[]>(
      `/messages/conversations/all`
    );
    return res.data;
  },

  acceptConversation: async (
    conversationId: number,
    adminId: number
  ): Promise<ConversationDTO> => {
    const res = await axiosInstance.post<ConversationDTO>(
      `/messages/conversations/${conversationId}/accept?adminId=${adminId}`
    );
    return res.data;
  },

  rejectConversation: async (
    conversationId: number,
    adminId: number
  ): Promise<ConversationDTO> => {
    const res = await axiosInstance.post<ConversationDTO>(
      `/messages/conversations/${conversationId}/reject?adminId=${adminId}`
    );
    return res.data;
  },

  closeConversation: async (
    conversationId: number,
    adminId: number
  ): Promise<ConversationDTO> => {
    const res = await axiosInstance.post<ConversationDTO>(
      `/messages/conversations/${conversationId}/close?adminId=${adminId}`
    );
    return res.data;
  },

  transferConversation: async (
    conversationId: number,
    currentAdminId: number,
    newAdminId: number
  ): Promise<ConversationDTO> => {
    const res = await axiosInstance.post<ConversationDTO>(
      `/messages/conversations/${conversationId}/transfer?currentAdminId=${currentAdminId}&newAdminId=${newAdminId}`
    );
    return res.data;
  },

  // ─── Messages ─────────────────────────────────────────────

  getMessages: async (
    conversationId: number,
    userId: number
  ): Promise<MessageDTO[]> => {
    const res = await axiosInstance.get<MessageDTO[]>(
      `/messages/conversations/${conversationId}/messages?userId=${userId}`
    );
    return res.data;
  },

  sendMessage: async (
    conversationId: number,
    senderId: number,
    data: SendMessageRequest
  ): Promise<MessageDTO> => {
    const res = await axiosInstance.post<MessageDTO>(
      `/messages/conversations/${conversationId}/messages?senderId=${senderId}`,
      data
    );
    return res.data;
  },
};
