import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import PasswordField from './components/PasswordField';
import GoogleButton from './components/GoogleButton';
import LoadingOverlay from './components/LoadingOverlay';
import TrustIndicators from './components/TrustIndicators';
import toast from 'react-hot-toast';

const ROLE_ROUTES = {
  msme:     '/app/dashboard',
  investor: '/app/investor',
  buyer:    '/app/buyer',
  admin:    '/app/admin',
};

export default function Login() {
  const { currentUser, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Auto-redirect if session is already active
  useEffect(() => {
    if (currentUser) {
      const isNewUser = !currentUser.onboardingCompleted && !currentUser.role;
      if (isNewUser) {
        navigate('/onboarding', { replace: true });
      } else {
        const dest = ROLE_ROUTES[currentUser.role] || '/app/dashboard';
        navigate(dest, { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in all credentials.");
    }

    setLoading(true);
    try {
      const user = await login(email, password, rememberMe);
      toast.success("Successfully logged in.");
      
      if (!user.onboardingCompleted && !user.role) {
        navigate('/onboarding', { replace: true });
      } else {
        const dest = ROLE_ROUTES[user.role] || '/app/dashboard';
        navigate(dest, { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(rememberMe);
      toast.success("Successfully logged in with Google.");
      
      if (!user.onboardingCompleted && !user.role) {
        navigate('/onboarding', { replace: true });
      } else {
        const dest = ROLE_ROUTES[user.role] || '/app/dashboard';
        navigate(dest, { replace: true });
      }
    } catch (error) {
      toast.error(error.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <LoadingOverlay active={loading} message="Authenticating session..." />
      
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Continue building a smarter invoice financing ecosystem.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@company.com"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordField
            label="Password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Options */}
          <div className="flex items-center justify-between text-xs font-semibold">
            <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-gray-50 dark:bg-dark-card/50"
              />
              <span>Remember Me</span>
            </label>
            <Link 
              to="/forgot-password" 
              className="text-primary-600 hover:text-primary-700 transition"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition shadow-lg shadow-primary-500/10 focus:outline-none"
          >
            Login
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-150 dark:border-dark-border"></div>
          <span className="flex-shrink mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white dark:bg-dark-bg px-2">Or</span>
          <div className="flex-grow border-t border-gray-150 dark:border-dark-border"></div>
        </div>

        {/* Google OAuth */}
        <GoogleButton onClick={handleGoogleLogin} disabled={loading} />

        {/* Footnote */}
        <p className="text-center text-xs text-gray-500">
          New to the platform?{' '}
          <Link to="/signup" className="font-bold text-primary-600 hover:text-primary-700">
            Create Account
          </Link>
        </p>

        {/* Security indicators */}
        <TrustIndicators />
      </div>
    </AuthLayout>
  );
}
