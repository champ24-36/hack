/*
  # Complete Database Setup for Vakeel Saab AI Legal Platform

  1. New Tables
    - `profiles` - User profile information extending auth.users
    - `legal_categories` - Categories of legal services
    - `lawyers` - Attorney profiles and information
    - `consultations` - Legal consultation bookings and details
    - `chat_sessions` - AI chat conversation sessions
    - `chat_messages` - Individual messages in chat sessions
    - `documents` - User uploaded legal documents
    - `consultation_notes` - Notes from legal consultations
    - `user_preferences` - User settings and preferences

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for lawyers to access their assigned consultations
    - Add policies for public access to legal categories and active lawyers

  3. Sample Data
    - Legal service categories
    - Sample attorney profiles
    - Performance indexes
    - Automatic timestamp triggers
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
DO $$ BEGIN
    CREATE TYPE consultation_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consultation_type AS ENUM ('video', 'phone', 'chat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level AS ENUM ('immediate', 'urgent', 'normal', 'flexible');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('contract', 'legal_notice', 'court_document', 'identification', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table (extends Supabase auth.users)
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

-- Create legal categories table
CREATE TABLE IF NOT EXISTS legal_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Add unique constraint to legal_categories name if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'legal_categories_name_key' 
    AND table_name = 'legal_categories'
  ) THEN
    ALTER TABLE legal_categories ADD CONSTRAINT legal_categories_name_key UNIQUE (name);
  END IF;
END $$;

-- Create lawyers table
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

-- Create consultations table
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

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat messages table
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

-- Create documents table
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

-- Create consultation notes table
CREATE TABLE IF NOT EXISTS consultation_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key)
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view legal categories" ON legal_categories;
DROP POLICY IF EXISTS "Anyone can view active lawyers" ON lawyers;
DROP POLICY IF EXISTS "Users can view their own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can create their own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can update their own consultations" ON consultations;
DROP POLICY IF EXISTS "Lawyers can view their assigned consultations" ON consultations;
DROP POLICY IF EXISTS "Users can manage their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can manage their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can manage their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view consultation notes for their consultations" ON consultation_notes;
DROP POLICY IF EXISTS "Lawyers can manage notes for their consultations" ON consultation_notes;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

-- Create RLS policies for profiles
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

-- Create RLS policies for legal categories (public read)
CREATE POLICY "Anyone can view legal categories"
  ON legal_categories FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for lawyers (public read for active lawyers)
CREATE POLICY "Anyone can view active lawyers"
  ON lawyers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create RLS policies for consultations
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

-- Create RLS policies for chat sessions
CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for chat messages
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

-- Create RLS policies for documents
CREATE POLICY "Users can manage their own documents"
  ON documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for consultation notes
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

-- Create RLS policies for user preferences
CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample legal categories (using individual INSERT statements to avoid conflicts)
INSERT INTO legal_categories (name, description, icon) 
SELECT 'Employment Law', 'Workplace rights, discrimination, contracts', 'briefcase'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Employment Law');

INSERT INTO legal_categories (name, description, icon) 
SELECT 'Housing & Tenant Rights', 'Landlord disputes, evictions, lease issues', 'home'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Housing & Tenant Rights');

INSERT INTO legal_categories (name, description, icon) 
SELECT 'Family Law', 'Divorce, custody, domestic relations', 'heart'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Family Law');

INSERT INTO legal_categories (name, description, icon) 
SELECT 'Business Law', 'Contracts, partnerships, compliance', 'building'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Business Law');

INSERT INTO legal_categories (name, description, icon) 
SELECT 'Personal Injury', 'Accidents, medical malpractice, compensation', 'shield'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Personal Injury');

INSERT INTO legal_categories (name, description, icon) 
SELECT 'Criminal Defense', 'Criminal charges, legal representation', 'shield-alert'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Criminal Defense');

INSERT INTO legal_categories (name, description, icon) 
SELECT 'Immigration', 'Visas, citizenship, deportation defense', 'globe'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Immigration');

INSERT INTO legal_categories (name, description, icon) 
SELECT 'Contract Law', 'Document review and contract disputes', 'file-text'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Contract Law');

INSERT INTO legal_categories (name, description, icon) 
SELECT 'Other Legal Matters', 'General legal questions and advice', 'help-circle'
WHERE NOT EXISTS (SELECT 1 FROM legal_categories WHERE name = 'Other Legal Matters');

-- Insert sample lawyers (using individual INSERT statements to avoid conflicts)
INSERT INTO lawyers (name, email, specialties, experience_years, rating, bio, license_number) 
SELECT 
  'Sarah Johnson, Esq.',
  'sarah.johnson@vakeelsaabai.com',
  ARRAY['Employment Law', 'Business Law'],
  15,
  4.9,
  'Sarah specializes in employment and business law with over 15 years of experience helping clients navigate workplace disputes and business formation.',
  'CA-BAR-12345'
WHERE NOT EXISTS (SELECT 1 FROM lawyers WHERE email = 'sarah.johnson@vakeelsaabai.com');

INSERT INTO lawyers (name, email, specialties, experience_years, rating, bio, license_number) 
SELECT 
  'Michael Chen, Esq.',
  'michael.chen@vakeelsaabai.com',
  ARRAY['Family Law', 'Personal Injury'],
  12,
  4.8,
  'Michael brings extensive experience in family law and personal injury cases, helping families navigate complex legal situations with compassion.',
  'NY-BAR-67890'
WHERE NOT EXISTS (SELECT 1 FROM lawyers WHERE email = 'michael.chen@vakeelsaabai.com');

INSERT INTO lawyers (name, email, specialties, experience_years, rating, bio, license_number) 
SELECT 
  'Emily Rodriguez, Esq.',
  'emily.rodriguez@vakeelsaabai.com',
  ARRAY['Housing Law', 'Immigration'],
  10,
  4.9,
  'Emily is passionate about protecting tenant rights and helping immigrants understand their legal options in the United States.',
  'TX-BAR-11111'
WHERE NOT EXISTS (SELECT 1 FROM lawyers WHERE email = 'emily.rodriguez@vakeelsaabai.com');

INSERT INTO lawyers (name, email, specialties, experience_years, rating, bio, license_number) 
SELECT 
  'David Wilson, Esq.',
  'david.wilson@vakeelsaabai.com',
  ARRAY['Criminal Defense', 'Constitutional Law'],
  18,
  4.7,
  'David has dedicated his career to defending the rights of the accused and ensuring everyone has access to quality legal representation.',
  'FL-BAR-22222'
WHERE NOT EXISTS (SELECT 1 FROM lawyers WHERE email = 'david.wilson@vakeelsaabai.com');

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

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lawyers_updated_at ON lawyers;
CREATE TRIGGER update_lawyers_updated_at 
  BEFORE UPDATE ON lawyers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultations_updated_at ON consultations;
CREATE TRIGGER update_consultations_updated_at 
  BEFORE UPDATE ON consultations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at 
  BEFORE UPDATE ON chat_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultation_notes_updated_at ON consultation_notes;
CREATE TRIGGER update_consultation_notes_updated_at 
  BEFORE UPDATE ON consultation_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();