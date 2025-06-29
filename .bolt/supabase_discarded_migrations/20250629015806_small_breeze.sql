/*
  # Fix Sign-In Authentication Issues

  1. Database Structure
    - Ensure profiles table exists with proper foreign key to auth.users
    - Enable Row Level Security (RLS)
    - Create proper RLS policies for authenticated users

  2. Authentication Flow
    - Create trigger function to automatically create profiles for new users
    - Set up proper permissions for authenticated users
    - Add necessary indexes for performance

  3. Security
    - Enable RLS on all user-related tables
    - Create policies that allow users to access only their own data
    - Grant appropriate permissions to authenticated role
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure profiles table exists with correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create RLS policies for profiles
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

-- Create function to handle new user registration
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

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for any existing auth users that don't have profiles
DO $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    au.email
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
EXCEPTION
  WHEN others THEN
    -- Ignore errors if no auth users exist yet
    NULL;
END $$;

-- Ensure other essential tables exist and have RLS enabled
ALTER TABLE IF EXISTS public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lawyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultation_notes ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Grant permissions on other tables if they exist
DO $$
BEGIN
  -- Grant permissions on tables that exist
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_sessions') THEN
    GRANT ALL ON public.chat_sessions TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
    GRANT ALL ON public.chat_messages TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consultations') THEN
    GRANT ALL ON public.consultations TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'documents') THEN
    GRANT ALL ON public.documents TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    GRANT ALL ON public.user_preferences TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'legal_categories') THEN
    GRANT SELECT ON public.legal_categories TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lawyers') THEN
    GRANT SELECT ON public.lawyers TO authenticated;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'consultation_notes') THEN
    GRANT ALL ON public.consultation_notes TO authenticated;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure the authenticated role exists and has proper permissions
DO $$
BEGIN
  -- Check if authenticated role exists, create if not
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  
  -- Grant connect permission
  GRANT CONNECT ON DATABASE postgres TO authenticated;
  
EXCEPTION
  WHEN others THEN
    -- Role might already exist or we might not have permission to create it
    -- This is fine in Supabase as the role should already exist
    NULL;
END $$;