/*
  # Complete Database Schema for Vakeel Saab AI

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
    - `legal_categories` - Categories of legal services
    - `lawyers` - Attorney profiles and information
    - `consultations` - Consultation bookings and sessions
    - `chat_sessions` - AI chat conversation sessions
    - `chat_messages` - Individual messages in chat sessions
    - `documents` - User uploaded legal documents
    - `consultation_notes` - Notes and summaries from consultations
    - `user_preferences` - User settings and preferences

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for lawyers to access their consultation data

  3. Features
    - Multi-language support
    - File attachments
    - Consultation scheduling
    - Chat history
    - Document management
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE consultation_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE consultation_type AS ENUM ('video', 'phone', 'chat');
CREATE TYPE urgency_level AS ENUM ('immediate', 'urgent', 'normal', 'flexible');
CREATE TYPE document_type AS ENUM ('contract', 'legal_notice', 'court_document', 'identification', 'other');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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

-- Legal categories table
CREATE TABLE IF NOT EXISTS legal_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Lawyers table
CREATE TABLE IF NOT EXISTS lawyers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE SET NULL,
  category_id uuid REFERENCES legal_categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  consultation_type consultation_type NOT NULL,
  status consultation_status DEFAULT 'scheduled',
  urgency urgency_level DEFAULT 'normal',
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

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  language text,
  attachments jsonb DEFAULT '[]',
  is_error boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  consultation_id uuid REFERENCES consultations(id) ON DELETE SET NULL,
  name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  document_type document_type DEFAULT 'other',
  description text,
  is_processed boolean DEFAULT false,
  analysis_summary text,
  created_at timestamptz DEFAULT now()
);

-- Consultation notes table
CREATE TABLE IF NOT EXISTS consultation_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Legal categories policies (public read)
CREATE POLICY "Anyone can view legal categories"
  ON legal_categories FOR SELECT
  TO authenticated
  USING (true);

-- Lawyers policies (public read for active lawyers)
CREATE POLICY "Anyone can view active lawyers"
  ON lawyers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Consultations policies
CREATE POLICY "Users can view their own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own consultations"
  ON consultations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Lawyers can view their assigned consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lawyers 
      WHERE lawyers.id = consultations.lawyer_id 
      AND lawyers.email = auth.jwt() ->> 'email'
    )
  );

-- Chat sessions policies
CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users can manage their own chat messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Documents policies
CREATE POLICY "Users can manage their own documents"
  ON documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Consultation notes policies
CREATE POLICY "Users can view consultation notes for their consultations"
  ON consultation_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultations 
      WHERE consultations.id = consultation_notes.consultation_id 
      AND consultations.user_id = auth.uid()
    )
    AND is_private = false
  );

CREATE POLICY "Lawyers can manage notes for their consultations"
  ON consultation_notes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultations 
      JOIN lawyers ON lawyers.id = consultations.lawyer_id
      WHERE consultations.id = consultation_notes.consultation_id 
      AND lawyers.email = auth.jwt() ->> 'email'
    )
  );

-- User preferences policies
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample legal categories
INSERT INTO legal_categories (name, description, icon) VALUES
  ('employment', 'Employment Law - Workplace rights, discrimination, contracts', 'briefcase'),
  ('housing', 'Housing & Tenant Rights - Landlord disputes, evictions, lease issues', 'home'),
  ('family', 'Family Law - Divorce, custody, domestic relations', 'heart'),
  ('business', 'Business Law - Contracts, partnerships, compliance', 'building'),
  ('personal_injury', 'Personal Injury - Accidents, medical malpractice, compensation', 'shield'),
  ('criminal', 'Criminal Defense - Criminal charges, legal representation', 'shield-alert'),
  ('immigration', 'Immigration - Visas, citizenship, deportation defense', 'globe'),
  ('contract', 'Contract Law - Document review and contract disputes', 'file-text'),
  ('other', 'Other Legal Matters - General legal questions and advice', 'help-circle');

-- Insert sample lawyers
INSERT INTO lawyers (name, email, specialties, experience_years, rating, bio, license_number) VALUES
  (
    'Sarah Johnson, Esq.',
    'sarah.johnson@vakeelsaabai.com',
    ARRAY['Employment Law', 'Business Law'],
    15,
    4.9,
    'Sarah specializes in employment and business law with over 15 years of experience helping clients navigate workplace disputes and business formation.',
    'CA-BAR-12345'
  ),
  (
    'Michael Chen, Esq.',
    'michael.chen@vakeelsaabai.com',
    ARRAY['Family Law', 'Personal Injury'],
    12,
    4.8,
    'Michael brings extensive experience in family law and personal injury cases, helping families navigate complex legal situations with compassion.',
    'NY-BAR-67890'
  ),
  (
    'Emily Rodriguez, Esq.',
    'emily.rodriguez@vakeelsaabai.com',
    ARRAY['Housing Law', 'Immigration'],
    10,
    4.9,
    'Emily is passionate about protecting tenant rights and helping immigrants understand their legal options in the United States.',
    'TX-BAR-11111'
  ),
  (
    'David Wilson, Esq.',
    'david.wilson@vakeelsaabai.com',
    ARRAY['Criminal Defense', 'Constitutional Law'],
    18,
    4.7,
    'David has dedicated his career to defending the rights of the accused and ensuring everyone has access to quality legal representation.',
    'FL-BAR-22222'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer_id ON consultations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_consultation_id ON documents(consultation_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lawyers_updated_at BEFORE UPDATE ON lawyers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultation_notes_updated_at BEFORE UPDATE ON consultation_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();