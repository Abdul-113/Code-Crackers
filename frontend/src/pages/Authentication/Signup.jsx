import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail } from 'lucide-react';
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

export default function Signup() {
  const { currentUser, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-redirect if session is already active
  useEffect(() => {
    if (currentUser) {
      if (!currentUser.onboardingCompleted) {
        navigate('/onboarding', { replace: true });
      } else {
        const dest = ROLE_ROUTES[currentUser.role] || '/app/dashboard';
        navigate(dest, { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      return toast.error("Please fill in all input fields.");
    }
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (!acceptTerms) {
      return toast.error("You must accept the terms of service.");
    }

    setLoading(true);
    try {
      await signup(email, password, name, true);
      toast.success("Account created successfully!");
      navigate('/onboarding', { replace: true });
    } catch (error) {
      toast.error(error.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle(true);
      toast.success("Successfully registered with Google.");
      if (!user.onboardingCompleted) {
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
      <LoadingOverlay active={loading} message="Creating account profile..." />

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
            Create Your Account
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sign up to join a secure invoice financing platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Full Name"
            id="name"
            placeholder="John Doe"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <PasswordField
            label="Confirm Password"
            id="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Accept terms */}
          <div className="flex items-start text-xs font-semibold">
            <label className="flex items-start gap-2.5 text-gray-600 dark:text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-gray-50 dark:bg-dark-card/50"
              />
              <span className="leading-normal">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition shadow-lg shadow-primary-500/10 focus:outline-none"
          >
            Create Account
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

        <p className="text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
            Login
          </Link>
        </p>

        {/* Security indicators */}
        <TrustIndicators />
      </div>
    </AuthLayout>
  );
}
