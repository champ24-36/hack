import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type ChatSession = Database['public']['Tables']['chat_sessions']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatSessionInsert = Database['public']['Tables']['chat_sessions']['Insert'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

export class ChatService {
  static async createSession(userId: string, language: string = 'en', title?: string): Promise<ChatSession | null> {
    try {
      const sessionData: ChatSessionInsert = {
        user_id: userId,
        language,
        title: title || 'New Chat Session',
        is_active: true
      };

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating chat session:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  }

  static async getUserSessions(userId: string): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chat sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      return [];
    }
  }

  static async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching chat messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  static async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    language?: string,
    attachments?: any[],
    isError: boolean = false
  ): Promise<ChatMessage | null> {
    try {
      const messageData: ChatMessageInsert = {
        session_id: sessionId,
        role,
        content,
        language,
        attachments: attachments || [],
        is_error: isError
      };

      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error saving chat message:', error);
        return null;
      }

      // Update session's updated_at timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      return null;
    }
  }

  static async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) {
        console.error('Error updating session title:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating session title:', error);
      return false;
    }
  }

  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) {
        console.error('Error deleting chat session:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting chat session:', error);
      return false;
    }
  }
}