import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Scale from 'lucide-react/dist/esm/icons/scale';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Lock from 'lucide-react/dist/esm/icons/lock';
import User from 'lucide-react/dist/esm/icons/user';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import useAuth from '../contexts/useAuth';
import useLanguage from '../contexts/useLanguage';
import LanguageSelector from '../components/LanguageSelector';
import { supabase } from '../lib/supabase';

interface DebugStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  timestamp?: string;
  duration?: number;
  details?: any;
}

const SignUpPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugSteps, setDebugSteps] = useState<DebugStep[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const { signup } = useAuth();
  const { selectedLanguage } = useLanguage();
  const navigate = useNavigate();

  // Initialize debug steps
  useEffect(() => {
    setDebugSteps([
      { id: 'validation', name: 'Client-side Validation', status: 'pending' },
      { id: 'env-check', name: 'Environment Variables Check', status: 'pending' },
      { id: 'db-test', name: 'Database Connection Test', status: 'pending' },
      { id: 'auth-signup', name: 'Supabase Auth Signup', status: 'pending' },
      { id: 'profile-create', name: 'Profile Creation', status: 'pending' },
      { id: 'navigation', name: 'Navigation to Dashboard', status: 'pending' }
    ]);

    // Test connection on component mount
    testInitialConnection();
  }, []);

  const testInitialConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setConnectionStatus('disconnected');
        console.error('🔴 Initial connection test failed:', error);
      } else {
        setConnectionStatus('connected');
        console.log('🟢 Initial connection test successful');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      console.error('🔴 Initial connection exception:', error);
    }
  };

  const updateDebugStep = (stepId: string, status: DebugStep['status'], message?: string, details?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, timestamp, details }
        : step
    ));
    
    const emoji = status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'running' ? '🔄' : '⏳';
    console.log(`${emoji} [${timestamp}] ${stepId.toUpperCase()}: ${status} ${message ? `- ${message}` : ''}`);
    if (details) {
      console.log('📋 Details:', details);
    }
  };

  const checkEnvironmentVariables = (): boolean => {
    updateDebugStep('env-check', 'running', 'Checking environment variables...');
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const envDetails = {
      VITE_SUPABASE_URL: supabaseUrl ? 'Present' : 'Missing',
      VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Present' : 'Missing',
      urlFormat: supabaseUrl ? (supabaseUrl.startsWith('https://') ? 'Valid' : 'Invalid') : 'N/A'
    };
    
    if (!supabaseUrl || !supabaseAnonKey) {
      updateDebugStep('env-check', 'error', 'Missing environment variables', envDetails);
      return false;
    }
    
    if (!supabaseUrl.startsWith('https://')) {
      updateDebugStep('env-check', 'error', 'Invalid Supabase URL format', envDetails);
      return false;
    }
    
    updateDebugStep('env-check', 'success', 'All environment variables present', envDetails);
    return true;
  };

  const testDatabaseConnection = async (): Promise<boolean> => {
    try {
      updateDebugStep('db-test', 'running', 'Testing connection...');
      
      const startTime = Date.now();
      
      // Test 1: Basic session check
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        updateDebugStep('db-test', 'error', `Session test failed: ${sessionError.message}`, { sessionError });
        return false;
      }
      
      // Test 2: Database query test
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      const duration = Date.now() - startTime;
      
      if (testError) {
        updateDebugStep('db-test', 'error', `Query test failed: ${testError.message} (${duration}ms)`, { testError, duration });
        return false;
      }
      
      // Test 3: Auth service availability
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      const totalDuration = Date.now() - startTime;
      
      if (authError && authError.message !== 'Auth session missing!') {
        updateDebugStep('db-test', 'error', `Auth service test failed: ${authError.message} (${totalDuration}ms)`, { authError, totalDuration });
        return false;
      }
      
      updateDebugStep('db-test', 'success', `All connection tests passed (${totalDuration}ms)`, { 
        sessionTest: 'passed', 
        queryTest: 'passed', 
        authTest: 'passed',
        totalDuration 
      });
      return true;
    } catch (error) {
      updateDebugStep('db-test', 'error', `Exception: ${error instanceof Error ? error.message : 'Unknown error'}`, { error });
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    setShowDebugPanel(true);
    
    // Reset all debug steps
    setDebugSteps(prev => prev.map(step => ({ ...step, status: 'pending', message: undefined, timestamp: undefined, details: undefined })));

    try {
      // STEP 1: Client-side validation
      updateDebugStep('validation', 'running', 'Checking form inputs...');
      
      const validationDetails = {
        name: name?.trim() ? 'Valid' : 'Invalid',
        email: email?.trim() && email.includes('@') ? 'Valid' : 'Invalid',
        password: password && password.length >= 6 ? 'Valid' : 'Invalid',
        confirmPassword: password === confirmPassword ? 'Valid' : 'Invalid',
        terms: acceptTerms ? 'Accepted' : 'Not accepted'
      };
      
      if (!name?.trim()) {
        updateDebugStep('validation', 'error', 'Name is required', validationDetails);
        setError('Please enter your full name');
        return;
      }

      if (!email?.trim()) {
        updateDebugStep('validation', 'error', 'Email is required', validationDetails);
        setError('Please enter your email address');
        return;
      }

      if (!email.includes('@')) {
        updateDebugStep('validation', 'error', 'Invalid email format', validationDetails);
        setError('Please enter a valid email address');
        return;
      }

      if (!password || password.length < 6) {
        updateDebugStep('validation', 'error', 'Password too short', validationDetails);
        setError('Password must be at least 6 characters long');
        return;
      }

      if (password !== confirmPassword) {
        updateDebugStep('validation', 'error', 'Passwords do not match', validationDetails);
        setError('Passwords do not match');
        return;
      }

      if (!acceptTerms) {
        updateDebugStep('validation', 'error', 'Terms not accepted', validationDetails);
        setError('Please accept the terms and conditions');
        return;
      }

      updateDebugStep('validation', 'success', 'All validations passed', validationDetails);

      // STEP 2: Environment variables check
      const envValid = checkEnvironmentVariables();
      if (!envValid) {
        setError('Configuration error. Please check environment variables.');
        return;
      }

      // STEP 3: Test database connection
      const dbConnected = await testDatabaseConnection();
      if (!dbConnected) {
        setError('Unable to connect to database. Please check your internet connection and try again.');
        return;
      }

      // STEP 4: Supabase Auth Signup
      updateDebugStep('auth-signup', 'running', 'Creating user account...');
      
      const authStartTime = Date.now();
      
      const signupData = {
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
          }
        }
      };
      
      console.log('🔐 Attempting signup with data:', { email: signupData.email, hasPassword: !!signupData.password, name: signupData.options.data.name });
      
      const { data: authData, error: authError } = await supabase.auth.signUp(signupData);

      const authDuration = Date.now() - authStartTime;

      if (authError) {
        updateDebugStep('auth-signup', 'error', `${authError.message} (${authDuration}ms)`, { 
          authError, 
          authDuration,
          signupData: { email: signupData.email, name: signupData.options.data.name }
        });
        
        if (authError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please try signing in instead.');
        } else if (authError.message.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.');
        } else if (authError.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else if (authError.message.includes('Signup is disabled')) {
          setError('Account creation is currently disabled. Please contact support.');
        } else {
          setError(`Signup failed: ${authError.message}`);
        }
        return;
      }

      if (!authData?.user) {
        updateDebugStep('auth-signup', 'error', `No user data returned (${authDuration}ms)`, { authData, authDuration });
        setError('Signup completed but no user data received. Please try signing in.');
        return;
      }

      updateDebugStep('auth-signup', 'success', `User created: ${authData.user.id} (${authDuration}ms)`, { 
        userId: authData.user.id,
        userEmail: authData.user.email,
        authDuration,
        session: authData.session ? 'Created' : 'Not created'
      });

      // STEP 5: Profile Creation (check if trigger worked)
      updateDebugStep('profile-create', 'running', 'Checking/creating user profile...');
      
      const profileStartTime = Date.now();
      
      try {
        // Wait a moment for the trigger to potentially create the profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if profile already exists (trigger might have created it)
        const { data: existingProfile, error: checkError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        const profileCheckDuration = Date.now() - profileStartTime;

        if (checkError && checkError.code !== 'PGRST116') {
          updateDebugStep('profile-create', 'error', `Profile check failed: ${checkError.message}`, { 
            checkError, 
            profileCheckDuration,
            userId: authData.user.id
          });
        } else if (existingProfile) {
          updateDebugStep('profile-create', 'success', `Profile exists (trigger created) (${profileCheckDuration}ms)`, { 
            existingProfile,
            profileCheckDuration
          });
        } else {
          // Create profile manually
          const manualCreateStartTime = Date.now();
          
          const profileData = {
            id: authData.user.id,
            name: name.trim(),
            email: email.trim(),
          };
          
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();

          const manualCreateDuration = Date.now() - manualCreateStartTime;

          if (profileError) {
            updateDebugStep('profile-create', 'error', `Manual creation failed: ${profileError.message} (${manualCreateDuration}ms)`, { 
              profileError, 
              profileData,
              manualCreateDuration
            });
            // Don't fail the signup for profile creation issues
            console.warn('⚠️ Profile creation failed, but continuing with signup');
          } else {
            updateDebugStep('profile-create', 'success', `Profile created manually (${manualCreateDuration}ms)`, { 
              newProfile,
              manualCreateDuration
            });
          }
        }
      } catch (profileException) {
        updateDebugStep('profile-create', 'error', `Exception: ${profileException instanceof Error ? profileException.message : 'Unknown'}`, { profileException });
        // Don't fail the signup for profile creation issues
        console.warn('⚠️ Profile creation exception, but continuing with signup');
      }

      // STEP 6: Navigation
      updateDebugStep('navigation', 'running', 'Preparing navigation...');
      
      // Store language preference
      sessionStorage.setItem('chatLanguage', selectedLanguage.code);
      
      // Small delay to ensure all async operations complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateDebugStep('navigation', 'success', 'Redirecting to dashboard...');
      
      // Use replace to prevent back button issues
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error('💥 Signup exception:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(`Signup failed: ${errorMessage}`);
      
      // Update the current step as error
      const currentStep = debugSteps.find(step => step.status === 'running');
      if (currentStep) {
        updateDebugStep(currentStep.id, 'error', `Exception: ${errorMessage}`, { error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (status: DebugStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <Scale className="h-12 w-12" style={{ color: '#B88271' }} />
            <span className="text-3xl font-bold text-black">Vakeel Saab AI</span>
          </Link>
          <h2 className="text-3xl font-bold text-black mb-2">Create your account</h2>
          <p className="text-gray-600">Join thousands who trust us with their legal needs</p>
          
          {/* Connection Status Indicator */}
          <div className={`text-xs mt-2 ${getConnectionStatusColor()}`}>
            Database: {connectionStatus === 'connected' ? '🟢 Connected' : connectionStatus === 'disconnected' ? '🔴 Disconnected' : '🟡 Checking...'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Debug Panel */}
            {showDebugPanel && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-blue-800">Signup Progress</h3>
                  <button
                    type="button"
                    onClick={() => setShowDebugPanel(false)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {debugSteps.map((step) => (
                    <div key={step.id} className="text-xs">
                      <div className="flex items-center space-x-2">
                        {getStepIcon(step.status)}
                        <span className={`font-medium ${
                          step.status === 'success' ? 'text-green-700' :
                          step.status === 'error' ? 'text-red-700' :
                          step.status === 'running' ? 'text-blue-700' :
                          'text-gray-600'
                        }`}>
                          {step.name}
                        </span>
                        {step.timestamp && (
                          <span className="text-gray-500">({step.timestamp})</span>
                        )}
                      </div>
                      {step.message && (
                        <div className="ml-6 text-gray-600">
                          {step.message}
                        </div>
                      )}
                      {step.details && (
                        <div className="ml-6 text-xs text-gray-500 font-mono">
                          {JSON.stringify(step.details, null, 2).substring(0, 200)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Create a password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B88271] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center disabled:opacity-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="border-t border-gray-200 pt-6">
              <LanguageSelector size="md" />
              <p className="text-xs text-gray-500 mt-2">
                Your AI assistant will respond in the selected language during chat sessions.
              </p>
            </div>

            <div className="flex items-center">
              <input
                id="signup-accept-terms"
                name="acceptTerms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-[#B88271] focus:ring-[#B88271] border-gray-300 rounded disabled:opacity-50"
                disabled={isSubmitting}
              />
              <label htmlFor="signup-accept-terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-[#B88271] hover:text-[#a86f5e] font-medium">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#B88271] hover:text-[#a86f5e] font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#B88271] hover:bg-[#a86f5e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B88271] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Debug Toggle */}
            {!showDebugPanel && debugSteps.some(step => step.status !== 'pending') && (
              <button
                type="button"
                onClick={() => setShowDebugPanel(true)}
                className="w-full text-xs text-blue-600 hover:text-blue-800 py-2"
              >
                Show Debug Information
              </button>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-[#B88271] rounded-lg shadow-sm text-sm font-medium text-[#B88271] bg-white hover:bg-[#f2e8e5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B88271] transition-colors"
              >
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;