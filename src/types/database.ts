export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          avatar_url: string | null
          address: string | null
          date_of_birth: string | null
          occupation: string | null
          emergency_contact: string | null
          preferred_language: string | null
          email_notifications: boolean | null
          sms_notifications: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          address?: string | null
          date_of_birth?: string | null
          occupation?: string | null
          emergency_contact?: string | null
          preferred_language?: string | null
          email_notifications?: boolean | null
          sms_notifications?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          address?: string | null
          date_of_birth?: string | null
          occupation?: string | null
          emergency_contact?: string | null
          preferred_language?: string | null
          email_notifications?: boolean | null
          sms_notifications?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      legal_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          created_at?: string | null
        }
      }
      lawyers: {
        Row: {
          id: string
          name: string
          email: string
          specialties: string[] | null
          experience_years: number | null
          rating: number | null
          bio: string | null
          avatar_url: string | null
          license_number: string | null
          bar_admissions: string[] | null
          hourly_rate: number | null
          available_hours: Json | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          specialties?: string[] | null
          experience_years?: number | null
          rating?: number | null
          bio?: string | null
          avatar_url?: string | null
          license_number?: string | null
          bar_admissions?: string[] | null
          hourly_rate?: number | null
          available_hours?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          specialties?: string[] | null
          experience_years?: number | null
          rating?: number | null
          bio?: string | null
          avatar_url?: string | null
          license_number?: string | null
          bar_admissions?: string[] | null
          hourly_rate?: number | null
          available_hours?: Json | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      consultations: {
        Row: {
          id: string
          user_id: string | null
          lawyer_id: string | null
          category_id: string | null
          title: string
          description: string | null
          consultation_type: Database['public']['Enums']['consultation_type']
          status: Database['public']['Enums']['consultation_status'] | null
          urgency: Database['public']['Enums']['urgency_level'] | null
          scheduled_date: string | null
          scheduled_time: string | null
          duration_minutes: number | null
          meeting_url: string | null
          meeting_id: string | null
          notes: string | null
          summary: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          lawyer_id?: string | null
          category_id?: string | null
          title: string
          description?: string | null
          consultation_type: Database['public']['Enums']['consultation_type']
          status?: Database['public']['Enums']['consultation_status'] | null
          urgency?: Database['public']['Enums']['urgency_level'] | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          duration_minutes?: number | null
          meeting_url?: string | null
          meeting_id?: string | null
          notes?: string | null
          summary?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          lawyer_id?: string | null
          category_id?: string | null
          title?: string
          description?: string | null
          consultation_type?: Database['public']['Enums']['consultation_type']
          status?: Database['public']['Enums']['consultation_status'] | null
          urgency?: Database['public']['Enums']['urgency_level'] | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          duration_minutes?: number | null
          meeting_url?: string | null
          meeting_id?: string | null
          notes?: string | null
          summary?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string | null
          title: string | null
          language: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          title?: string | null
          language?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          title?: string | null
          language?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string | null
          role: string
          content: string
          language: string | null
          attachments: Json | null
          is_error: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          session_id?: string | null
          role: string
          content: string
          language?: string | null
          attachments?: Json | null
          is_error?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string | null
          role?: string
          content?: string
          language?: string | null
          attachments?: Json | null
          is_error?: boolean | null
          created_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string | null
          consultation_id: string | null
          name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          document_type: Database['public']['Enums']['document_type'] | null
          description: string | null
          is_processed: boolean | null
          analysis_summary: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          consultation_id?: string | null
          name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          document_type?: Database['public']['Enums']['document_type'] | null
          description?: string | null
          is_processed?: boolean | null
          analysis_summary?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          consultation_id?: string | null
          name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          document_type?: Database['public']['Enums']['document_type'] | null
          description?: string | null
          is_processed?: boolean | null
          analysis_summary?: string | null
          created_at?: string | null
        }
      }
      consultation_notes: {
        Row: {
          id: string
          consultation_id: string | null
          lawyer_id: string | null
          content: string
          is_private: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          consultation_id?: string | null
          lawyer_id?: string | null
          content: string
          is_private?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          consultation_id?: string | null
          lawyer_id?: string | null
          content?: string
          is_private?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string | null
          key: string
          value: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          key: string
          value?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          key?: string
          value?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      consultation_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'
      consultation_type: 'video' | 'phone' | 'chat'
      urgency_level: 'immediate' | 'urgent' | 'normal' | 'flexible'
      document_type: 'contract' | 'legal_notice' | 'court_document' | 'identification' | 'other'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}