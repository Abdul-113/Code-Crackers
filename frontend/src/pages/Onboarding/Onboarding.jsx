import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingLayout from './components/OnboardingLayout';
import ProgressStepper from './components/ProgressStepper';
import WelcomeStep from './components/WelcomeStep';
import RoleStep from './components/RoleStep';
import ProfileStep from './components/ProfileStep';
import AISetupStep from './components/AISetupStep';
import WalletConnectStep from './components/WalletConnectStep';
import CompletionStep from './components/CompletionStep';
import toast from 'react-hot-toast';

export default function Onboarding() {
  const { currentUser, completeOnboarding, isMock } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const [profileData, setProfileData] = useState({
    businessName: '',
    gst: '',
    category: 'Manufacturing',
    revenue: '₹1 Cr - ₹5 Cr',
    size: '11-50',
    country: 'India',
    state: '',
    city: ''
  });
  const [demoMode, setDemoMode] = useState(false);

  const ROLE_HOME = {
    msme:     '/app/dashboard',
    investor: '/app/investor',
    buyer:    '/app/buyer',
    admin:    '/app/admin',
  };

  // Firestore user Profile update helper
  const handleOnboardingComplete = async () => {
    try {
      await completeOnboarding(selectedRole || 'msme', profileData, demoMode);
      toast.success("Profile customized successfully!");
      const destination = ROLE_HOME[selectedRole] || '/app/dashboard';
      navigate(destination);
    } catch (err) {
      toast.error("Failed to complete onboarding updates.");
      console.error(err);
    }
  };

  const handleNext = () => {
    if (selectedRole === 'admin' && step === 2) {
      setStep(7); // Skip to completion for admins
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (selectedRole === 'admin' && step === 7) {
      setStep(2);
      return;
    }
    setStep(prev => Math.max(1, prev - 1));
  };

  return (
    <OnboardingLayout>
      {/* Do not show stepper on first (welcome) and last (completion) screen */}
      {step > 1 && step < 7 && (
        <ProgressStepper step={step - 1} totalSteps={5} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {step === 1 && (
            <WelcomeStep onNext={handleNext} />
          )}
          {step === 2 && (
            <RoleStep 
              selectedRole={selectedRole} 
              onSelectRole={setSelectedRole} 
              onNext={handleNext} 
              onPrev={handlePrev}
            />
          )}
          {step === 3 && (
            <ProfileStep 
              role={selectedRole}
              profileData={profileData} 
              setProfileData={setProfileData} 
              onNext={handleNext} 
              onPrev={handlePrev} 
            />
          )}
          {step === 4 && (
            <WalletConnectStep 
              onNext={handleNext} 
              profileData={profileData} 
              setProfileData={setProfileData} 
            />
          )}
          {step === 5 && (
            <AISetupStep onNext={handleOnboardingComplete} />
          )}
          {step === 7 && (
            <CompletionStep onFinish={handleOnboardingComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  );
}
