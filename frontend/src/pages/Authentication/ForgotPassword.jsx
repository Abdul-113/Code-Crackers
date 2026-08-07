import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from './components/AuthLayout';
import InputField from './components/InputField';
import LoadingOverlay from './components/LoadingOverlay';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address.");

    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
      toast.success("Password reset instructions sent.");
    } catch (error) {
      toast.error(error.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <LoadingOverlay active={loading} message="Sending reset link..." />

      <div className="space-y-6">
        <div className="space-y-2">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition uppercase tracking-wider mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
          <h2 className="text-3xl font-display font-extrabold tracking-tight text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-success-500/20 bg-success-500/5 dark:bg-success-500/10 p-6 space-y-3">
            <h4 className="font-display font-bold text-success-600 dark:text-success-400 text-sm">Reset Link Sent</h4>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              We've dispatched an email to <span className="font-bold text-gray-800 dark:text-white">{email}</span> with a secure URL to change your password.
            </p>
          </div>
        ) : (
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

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition shadow-lg shadow-primary-500/10 focus:outline-none"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </AuthLayout>
  );
}
