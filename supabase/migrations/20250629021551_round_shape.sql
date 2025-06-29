-- Verification Script for Supabase Setup
-- Run this in Supabase SQL Editor to check your database

-- 1. Check if all tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check RLS status on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Check all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_condition
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Check if auth trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name = 'on_auth_user_created';

-- 5. Test auth.uid() function (should return null if not authenticated)
SELECT auth.uid() as current_user_id;

-- 6. Check existing users and profiles
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  au.created_at as auth_created,
  p.id as profile_id,
  p.name as profile_name,
  p.email as profile_email
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- 7. Check sample data
SELECT 'Legal Categories' as table_name, count(*) as record_count FROM legal_categories
UNION ALL
SELECT 'Lawyers', count(*) FROM lawyers
UNION ALL
SELECT 'Profiles', count(*) FROM profiles
UNION ALL
SELECT 'Chat Sessions', count(*) FROM chat_sessions
UNION ALL
SELECT 'Consultations', count(*) FROM consultations;