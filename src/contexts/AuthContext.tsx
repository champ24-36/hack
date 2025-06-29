import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profile?: Profile;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        } else {
          console.log('✅ Initial session retrieved:', session ? 'User logged in' : 'No session');
        }

        if (mounted) {
          if (session?.user) {
            await loadUserProfile(session.user);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('💥 Exception in getInitialSession:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, session ? 'User present' : 'No user');
      
      if (!mounted) return;

      try {
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('💥 Error in auth state change:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('👤 Loading profile for user:', supabaseUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('❌ Profile loading error:', error);
        
        if (error.code === 'PGRST116') {
          console.log('📝 Profile not found, creating new profile...');
          await createUserProfile(supabaseUser);
          return;
        } else {
          console.error('💥 Unexpected profile error:', error);
          throw error;
        }
      }

      console.log('✅ Profile loaded successfully:', profile);

      const userData: User = {
        id: supabaseUser.id,
        name: profile?.name || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        avatar: profile?.avatar_url || undefined,
        profile: profile || undefined
      };

      setUser(userData);
    } catch (error) {
      console.error('💥 Exception in loadUserProfile:', error);
      // Try to create profile as fallback
      await createUserProfile(supabaseUser);
    }
  };

  const createUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🆕 Creating new profile for user:', supabaseUser.id);
      
      const profileData = {
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
      };

      console.log('📝 Profile data to insert:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile creation error:', error);
        throw error;
      } else {
        console.log('✅ Profile created successfully:', data);
        // Reload the profile after creation
        await loadUserProfile(supabaseUser);
      }
    } catch (error) {
      console.error('💥 Exception in createUserProfile:', error);
      
      // Set user data even if profile creation fails
      const userData: User = {
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
      };
      setUser(userData);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
        } else if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please check your email and click the confirmation link before signing in.' };
        } else if (error.message.includes('Too many requests')) {
          return { success: false, error: 'Too many login attempts. Please wait a moment before trying again.' };
        } else if (error.message.includes('User not found')) {
          return { success: false, error: 'No account found with this email address. Please check your email or create a new account.' };
        } else {
          return { success: false, error: error.message || 'An error occurred during sign in. Please try again.' };
        }
      }

      console.log('✅ Login successful:', data.user ? 'User data received' : 'No user data');

      if (data.user) {
        await loadUserProfile(data.user);
      }

      return { success: true };
    } catch (error) {
      console.error('💥 Exception in login:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📝 Starting signup process for:', email);
      
      // Validate inputs
      if (!name?.trim()) {
        console.log('❌ Validation failed: No name provided');
        return { success: false, error: 'Please enter your full name.' };
      }

      if (!email?.trim()) {
        console.log('❌ Validation failed: No email provided');
        return { success: false, error: 'Please enter your email address.' };
      }

      if (!email.includes('@')) {
        console.log('❌ Validation failed: Invalid email format');
        return { success: false, error: 'Please enter a valid email address.' };
      }

      if (!password || password.length < 6) {
        console.log('❌ Validation failed: Password too short');
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      console.log('✅ Input validation passed');

      // Test database connection first
      console.log('🔍 Testing database connection...');
      try {
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (testError) {
          console.error('❌ Database connection test failed:', testError);
          return { success: false, error: `Database connection failed: ${testError.message}` };
        }
        console.log('✅ Database connection test passed');
      } catch (dbError) {
        console.error('💥 Database connection exception:', dbError);
        return { success: false, error: 'Unable to connect to database. Please try again.' };
      }

      console.log('🚀 Calling Supabase auth.signUp...');
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          }
        }
      });

      console.log('📊 Signup response:', {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        error: error?.message || 'No error'
      });

      if (error) {
        console.error('❌ Signup error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          cause: error.cause
        });
        
        // Handle specific error cases
        if (error.message.includes('User already registered') || error.message.includes('user_already_exists')) {
          return { success: false, error: 'An account with this email address already exists. Please try signing in instead.' };
        } else if (error.message.includes('Password should be at least')) {
          return { success: false, error: 'Password must be at least 6 characters long.' };
        } else if (error.message.includes('Invalid email')) {
          return { success: false, error: 'Please enter a valid email address.' };
        } else if (error.message.includes('Signup is disabled')) {
          return { success: false, error: 'Account registration is currently disabled. Please contact support.' };
        } else if (error.message.includes('Email rate limit exceeded')) {
          return { success: false, error: 'Too many signup attempts. Please wait a moment before trying again.' };
        } else if (error.message.includes('Database error')) {
          return { success: false, error: 'Database error occurred. Please try again or contact support.' };
        } else {
          return { success: false, error: `Signup failed: ${error.message}` };
        }
      }

      if (!data?.user) {
        console.error('❌ No user data returned from signup');
        return { success: false, error: 'Signup completed but no user data received. Please try signing in.' };
      }

      console.log('✅ User created successfully:', data.user.id);

      // Create profile immediately
      try {
        console.log('📝 Creating user profile...');
        
        const profileData = {
          id: data.user.id,
          name: name.trim(),
          email: email.trim(),
        };

        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
          // Don't fail the signup if profile creation fails, as the trigger should handle it
          console.log('⚠️ Profile creation failed, but continuing with signup...');
        } else {
          console.log('✅ Profile created successfully:', profileResult);
        }

        await loadUserProfile(data.user);
      } catch (profileError) {
        console.error('💥 Exception creating profile during signup:', profileError);
        // Don't fail the signup, the trigger should create the profile
        console.log('⚠️ Profile creation exception, but continuing...');
      }

      console.log('🎉 Signup process completed successfully');
      return { success: true };
    } catch (error) {
      console.error('💥 Exception in signup:', error);
      
      // Provide more detailed error information
      if (error instanceof Error) {
        return { success: false, error: `Signup failed: ${error.message}` };
      } else {
        return { success: false, error: 'An unexpected error occurred during signup. Please try again.' };
      }
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('💥 Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };