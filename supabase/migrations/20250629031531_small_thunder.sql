/*
  # Rebuild Complete Authentication System

  1. Clean Up
    - Remove all existing users and profiles
    - Drop and recreate all tables and policies
    - Reset authentication system

  2. Database Schema
    - Create all custom types/enums
    - Create all tables with proper relationships
    - Set up Row Level Security (RLS)
    - Create indexes for performance

  3. Authentication Setup
    - Create profile creation trigger
    - Set up proper RLS policies
    - Insert sample data

  4. Security
    - Enable RLS on all tables
    - Create appropriate policies for each table
    - Grant necessary permissions
*/

-- =============================================
-- STEP 1: CLEAN UP EXISTING DATA
-- =============================================

-- Drop all existing triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_lawyers_updated_at ON public.lawyers;
DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON public.chat_sessions;
DROP TRIGGER IF EXISTS update_consultation_notes_updated_at ON public.consultation_notes;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;

-- Drop all existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.consultation_notes CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.lawyers CASCADE;
DROP TABLE IF EXISTS public.legal_categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Drop all existing types
DROP TYPE IF EXISTS public.document_type CASCADE;
DROP TYPE IF EXISTS public.urgency_level CASCADE;
DROP TYPE IF EXISTS public.consultation_type CASCADE;
DROP TYPE IF EXISTS public.consultation_status CASCADE;

-- Clear all existing users from auth.users (this will remove all authentication data)
DELETE FROM auth.users;

-- =============================================
-- STEP 2: CREATE CUSTOM TYPES
-- =============================================

CREATE TYPE public.consultation_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE public.consultation_type AS ENUM ('video', 'phone', 'chat');
CREATE TYPE public.urgency_level AS ENUM ('immediate', 'urgent', 'normal', 'flexible');
CREATE TYPE public.document_type AS ENUM ('contract', 'legal_notice', 'court_document', 'identification', 'other');

-- =============================================
-- STEP 3: CREATE UTILITY FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- STEP 4: CREATE TABLES
-- =============================================

-- 1. PROFILES TABLE (Main user data)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  avatar_url text,
  address text,
  date_of_birth date,
  occupation text,
  emergency_contact text,
  preferred_language text DEFAULT 'en',
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. LEGAL CATEGORIES TABLE
CREATE TABLE public.legal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- 3. LAWYERS TABLE
CREATE TABLE public.lawyers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  specialties text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0.0,
  bio text,
  avatar_url text,
  license_number text,
  bar_admissions text[],
  hourly_rate numeric(10,2),
  available_hours jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. CONSULTATIONS TABLE
CREATE TABLE public.consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.legal_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  consultation_type public.consultation_type NOT NULL,
  status public.consultation_status DEFAULT 'scheduled',
  urgency public.urgency_level DEFAULT 'normal',
  scheduled_date date,
  scheduled_time time,
  duration_minutes integer DEFAULT 60,
  meeting_url text,
  meeting_id text,
  notes text,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. CHAT SESSIONS TABLE
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text,
  language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. CHAT MESSAGES TABLE
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  language text,
  attachments jsonb DEFAULT '[]',
  is_error boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 7. DOCUMENTS TABLE
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE SET NULL,
  name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  document_type public.document_type DEFAULT 'other',
  description text,
  is_processed boolean DEFAULT false,
  analysis_summary text,
  created_at timestamptz DEFAULT now()
);

-- 8. CONSULTATION NOTES TABLE
CREATE TABLE public.consultation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES public.consultations(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES public.lawyers(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. USER PREFERENCES TABLE
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key)
);

-- =============================================
-- STEP 5: CREATE INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_id ON public.profiles(id);
CREATE INDEX idx_consultations_user_id ON public.consultations(user_id);
CREATE INDEX idx_consultations_lawyer_id ON public.consultations(lawyer_id);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_date ON public.consultations(scheduled_date);
CREATE INDEX idx_chat_sessions_user_id ON public.chat_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_consultation_id ON public.documents(consultation_id);

-- =============================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 7: CREATE RLS POLICIES
-- =============================================

-- PROFILES POLICIES
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- LEGAL CATEGORIES POLICIES
CREATE POLICY "Anyone can view legal categories"
  ON public.legal_categories FOR SELECT
  TO authenticated
  USING (true);

-- LAWYERS POLICIES
CREATE POLICY "Anyone can view active lawyers"
  ON public.lawyers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- CONSULTATIONS POLICIES
CREATE POLICY "Users can view their own consultations"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consultations"
  ON public.consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consultations"
  ON public.consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultations"
  ON public.consultations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can view their assigned consultations"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.lawyers 
    WHERE lawyers.id = consultations.lawyer_id 
    AND lawyers.email = (auth.jwt() ->> 'email')
  ));

-- CHAT SESSIONS POLICIES
CREATE POLICY "Users can manage their own chat sessions"
  ON public.chat_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CHAT MESSAGES POLICIES
CREATE POLICY "Users can manage their own chat messages"
  ON public.chat_messages FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  ));

-- DOCUMENTS POLICIES
CREATE POLICY "Users can manage their own documents"
  ON public.documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CONSULTATION NOTES POLICIES
CREATE POLICY "Users can view consultation notes for their consultations"
  ON public.consultation_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations 
      WHERE consultations.id = consultation_notes.consultation_id 
      AND consultations.user_id = auth.uid()
    ) AND is_private = false
  );

CREATE POLICY "Lawyers can manage notes for their consultations"
  ON public.consultation_notes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.consultations
    JOIN public.lawyers ON lawyers.id = consultations.lawyer_id
    WHERE consultations.id = consultation_notes.consultation_id
    AND lawyers.email = (auth.jwt() ->> 'email')
  ));

-- USER PREFERENCES POLICIES
CREATE POLICY "Users can manage their own preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- STEP 8: CREATE TRIGGERS
-- =============================================

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lawyers_updated_at
  BEFORE UPDATE ON public.lawyers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_notes_updated_at
  BEFORE UPDATE ON public.consultation_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- STEP 9: CREATE USER REGISTRATION FUNCTION AND TRIGGER
-- =============================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STEP 10: INSERT SAMPLE DATA
-- =============================================

-- Insert sample legal categories
INSERT INTO public.legal_categories (name, description, icon) VALUES
  ('Employment Law', 'Workplace rights, discrimination, wrongful termination', 'briefcase'),
  ('Housing & Tenant Rights', 'Landlord disputes, evictions, lease issues', 'home'),
  ('Family Law', 'Divorce, custody, domestic relations', 'heart'),
  ('Business Law', 'Contracts, partnerships, compliance', 'building'),
  ('Personal Injury', 'Accidents, compensation claims', 'shield'),
  ('Criminal Defense', 'Understanding charges and rights', 'shield-alert'),
  ('Immigration', 'Visas, citizenship, deportation defense', 'globe'),
  ('Contract Law', 'Understanding agreements and obligations', 'file-text');

-- Insert sample lawyers
INSERT INTO public.lawyers (name, email, specialties, experience_years, rating, bio, is_active) VALUES
  ('Sarah Johnson', 'sarah.johnson@vakeelsaab.com', ARRAY['Employment Law', 'Business Law'], 15, 4.9, 'Experienced employment and business law attorney with a focus on helping individuals understand their workplace rights.', true),
  ('Michael Chen', 'michael.chen@vakeelsaab.com', ARRAY['Family Law', 'Personal Injury'], 12, 4.8, 'Compassionate family law attorney specializing in divorce, custody, and personal injury cases.', true),
  ('Emily Rodriguez', 'emily.rodriguez@vakeelsaab.com', ARRAY['Housing Law', 'Immigration'], 10, 4.9, 'Dedicated to protecting tenant rights and helping immigrants navigate the legal system.', true),
  ('David Wilson', 'david.wilson@vakeelsaab.com', ARRAY['Criminal Defense', 'Constitutional Law'], 18, 4.7, 'Experienced criminal defense attorney committed to protecting the rights of the accused.', true);

-- =============================================
-- STEP 11: GRANT PERMISSIONS
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on all tables
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_messages TO authenticated;
GRANT ALL ON public.consultations TO authenticated;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.consultation_notes TO authenticated;
GRANT SELECT ON public.legal_categories TO authenticated;
GRANT SELECT ON public.lawyers TO authenticated;

-- Grant permissions on sequences (for auto-generated UUIDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;