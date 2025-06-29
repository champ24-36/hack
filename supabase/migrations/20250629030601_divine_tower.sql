/*
  # Complete Database Setup for Vakeel Saab AI

  1. New Tables
    - `profiles` - User profile information
    - `legal_categories` - Legal service categories
    - `lawyers` - Attorney information
    - `consultations` - User consultation bookings
    - `chat_sessions` - AI chat sessions
    - `chat_messages` - Chat conversation history
    - `documents` - User uploaded documents
    - `consultation_notes` - Attorney notes
    - `user_preferences` - User settings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for lawyers to access their consultation data

  3. Sample Data
    - Legal categories for different practice areas
    - Sample lawyers with specialties
*/

-- Create custom types/enums only if they don't exist
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES TABLE
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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

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

-- 2. LEGAL CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS legal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE legal_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view legal categories" ON legal_categories;

CREATE POLICY "Anyone can view legal categories"
  ON legal_categories FOR SELECT
  TO authenticated
  USING (true);

-- 3. LAWYERS TABLE
CREATE TABLE IF NOT EXISTS lawyers (
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

ALTER TABLE lawyers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active lawyers" ON lawyers;

CREATE POLICY "Anyone can view active lawyers"
  ON lawyers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 4. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can insert their own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can update their own consultations" ON consultations;
DROP POLICY IF EXISTS "Lawyers can view their assigned consultations" ON consultations;

CREATE POLICY "Users can view their own consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consultations"
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
  USING (EXISTS (
    SELECT 1 FROM lawyers 
    WHERE lawyers.id = consultations.lawyer_id 
    AND lawyers.email = (auth.jwt() ->> 'email')
  ));

-- 5. CHAT SESSIONS TABLE
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own chat sessions" ON chat_sessions;

CREATE POLICY "Users can manage their own chat sessions"
  ON chat_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  language text,
  attachments jsonb DEFAULT '[]',
  is_error boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own chat messages" ON chat_messages;

CREATE POLICY "Users can manage their own chat messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND chat_sessions.user_id = auth.uid()
  ));

-- 7. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own documents" ON documents;

CREATE POLICY "Users can manage their own documents"
  ON documents FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. CONSULTATION NOTES TABLE
CREATE TABLE IF NOT EXISTS consultation_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id uuid REFERENCES consultations(id) ON DELETE CASCADE,
  lawyer_id uuid REFERENCES lawyers(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_private boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view consultation notes for their consultations" ON consultation_notes;
DROP POLICY IF EXISTS "Lawyers can manage notes for their consultations" ON consultation_notes;

CREATE POLICY "Users can view consultation notes for their consultations"
  ON consultation_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM consultations 
      WHERE consultations.id = consultation_notes.consultation_id 
      AND consultations.user_id = auth.uid()
    ) AND is_private = false
  );

CREATE POLICY "Lawyers can manage notes for their consultations"
  ON consultation_notes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM consultations
    JOIN lawyers ON lawyers.id = consultations.lawyer_id
    WHERE consultations.id = consultation_notes.consultation_id
    AND lawyers.email = (auth.jwt() ->> 'email')
  ));

-- 9. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  key text NOT NULL,
  value jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, key)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_lawyer_id ON consultations(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_date ON consultations(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_consultation_id ON documents(consultation_id);

-- Add updated_at triggers (drop first if they exist)
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

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample legal categories
INSERT INTO legal_categories (name, description, icon) VALUES
  ('Employment Law', 'Workplace rights, discrimination, wrongful termination', 'briefcase'),
  ('Housing & Tenant Rights', 'Landlord disputes, evictions, lease issues', 'home'),
  ('Family Law', 'Divorce, custody, domestic relations', 'heart'),
  ('Business Law', 'Contracts, partnerships, compliance', 'building'),
  ('Personal Injury', 'Accidents, compensation claims', 'shield'),
  ('Criminal Defense', 'Understanding charges and rights', 'shield-alert'),
  ('Immigration', 'Visas, citizenship, deportation defense', 'globe'),
  ('Contract Law', 'Understanding agreements and obligations', 'file-text')
ON CONFLICT (name) DO NOTHING;

-- Insert sample lawyers
INSERT INTO lawyers (name, email, specialties, experience_years, rating, bio, is_active) VALUES
  ('Sarah Johnson', 'sarah.johnson@vakeelsaab.com', ARRAY['Employment Law', 'Business Law'], 15, 4.9, 'Experienced employment and business law attorney with a focus on helping individuals understand their workplace rights.', true),
  ('Michael Chen', 'michael.chen@vakeelsaab.com', ARRAY['Family Law', 'Personal Injury'], 12, 4.8, 'Compassionate family law attorney specializing in divorce, custody, and personal injury cases.', true),
  ('Emily Rodriguez', 'emily.rodriguez@vakeelsaab.com', ARRAY['Housing Law', 'Immigration'], 10, 4.9, 'Dedicated to protecting tenant rights and helping immigrants navigate the legal system.', true),
  ('David Wilson', 'david.wilson@vakeelsaab.com', ARRAY['Criminal Defense', 'Constitutional Law'], 18, 4.7, 'Experienced criminal defense attorney committed to protecting the rights of the accused.', true)
ON CONFLICT (email) DO NOTHING;

-- Create profiles for any existing users that don't have them
INSERT INTO profiles (id, name, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  au.email
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;