/*
  # Authentication and Profile Setup Migration

  1. Database Setup
    - Verify and create profiles table with proper foreign key to auth.users
    - Enable RLS and create policies for secure access
    - Create trigger function for automatic profile creation
    - Set up proper permissions and indexes

  2. Security
    - Enable RLS on profiles table
    - Create policies for authenticated users to manage their own data
    - Grant necessary permissions to authenticated role

  3. Features
    - Automatic profile creation when users sign up
    - Proper foreign key relationships
    - Performance indexes
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure profiles table exists with correct structure
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

-- 2. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist and recreate them
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

-- 4. Create function to handle new user registration
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

-- 5. Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create profiles for any existing auth users that don't have them
INSERT INTO public.profiles (id, name, email)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'name', au.email),
  au.email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 7. Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Grant permissions for other tables if they exist
DO $$
BEGIN
  -- Check if tables exist before granting permissions
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
END $$;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- 9. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Verify the setup by checking if the profiles table is properly configured
DO $$
DECLARE
  table_exists boolean;
  rls_enabled boolean;
  policy_count integer;
BEGIN
  -- Check if profiles table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO table_exists;
  
  -- Check if RLS is enabled
  SELECT rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public' AND tablename = 'profiles'
  INTO rls_enabled;
  
  -- Count policies
  SELECT COUNT(*) 
  FROM pg_policies 
  WHERE schemaname = 'public' AND tablename = 'profiles'
  INTO policy_count;
  
  -- Log results
  RAISE NOTICE 'Profiles table exists: %', table_exists;
  RAISE NOTICE 'RLS enabled: %', rls_enabled;
  RAISE NOTICE 'Number of policies: %', policy_count;
  
  -- Ensure everything is set up correctly
  IF NOT table_exists THEN
    RAISE EXCEPTION 'Profiles table was not created successfully';
  END IF;
  
  IF NOT rls_enabled THEN
    RAISE EXCEPTION 'RLS is not enabled on profiles table';
  END IF;
  
  IF policy_count < 3 THEN
    RAISE EXCEPTION 'Not all required policies were created (expected 3, got %)', policy_count;
  END IF;
  
  RAISE NOTICE 'Migration completed successfully!';
END $$;