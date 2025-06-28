import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type Consultation = Database['public']['Tables']['consultations']['Row'];
type ConsultationInsert = Database['public']['Tables']['consultations']['Insert'];
type Lawyer = Database['public']['Tables']['lawyers']['Row'];
type LegalCategory = Database['public']['Tables']['legal_categories']['Row'];

export class ConsultationService {
  static async getLawyers(): Promise<Lawyer[]> {
    try {
      const { data, error } = await supabase
        .from('lawyers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching lawyers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching lawyers:', error);
      return [];
    }
  }

  static async getLegalCategories(): Promise<LegalCategory[]> {
    try {
      const { data, error } = await supabase
        .from('legal_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching legal categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching legal categories:', error);
      return [];
    }
  }

  static async createConsultation(consultationData: ConsultationInsert): Promise<Consultation | null> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .insert(consultationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating consultation:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating consultation:', error);
      return null;
    }
  }

  static async getUserConsultations(userId: string): Promise<Consultation[]> {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          lawyers (
            name,
            email,
            specialties,
            rating,
            experience_years
          ),
          legal_categories (
            name,
            description
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user consultations:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user consultations:', error);
      return [];
    }
  }

  static async updateConsultationStatus(
    consultationId: string, 
    status: Database['public']['Enums']['consultation_status']
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ status })
        .eq('id', consultationId);

      if (error) {
        console.error('Error updating consultation status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating consultation status:', error);
      return false;
    }
  }
}