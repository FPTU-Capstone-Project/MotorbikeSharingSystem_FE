import { httpClient } from './http-client';
import type { ChatMessageResponse, SendMessageRequest } from '../types/api.types';

export class ChatAPI {
  /**
   * Get all messages in a conversation by conversationId
   */
  static async getMessagesByConversationId(
    conversationId: string
  ): Promise<ChatMessageResponse[]> {
    return httpClient.get<ChatMessageResponse[]>(
      `/chat/conversations/by-id/${conversationId}/messages`,
      undefined,
      {
        enableCache: false,
      }
    );
  }

  /**
   * Send a message
   */
  static async sendMessage(
    data: SendMessageRequest
  ): Promise<ChatMessageResponse> {
    return httpClient.post<ChatMessageResponse>(
      '/chat/messages',
      data,
      {
        enableCache: false,
      }
    );
  }

  /**
   * Generate conversation ID for report chat
   */
  static generateReportConversationId(
    reportId: number,
    userId1: number,
    userId2: number
  ): string {
    const smaller = Math.min(userId1, userId2);
    const larger = Math.max(userId1, userId2);
    return `report_${reportId}_users_${smaller}_${larger}`;
  }
}