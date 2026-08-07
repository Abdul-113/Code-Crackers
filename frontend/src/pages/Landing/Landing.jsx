import React, { useState, useEffect } from 'react';
import Navbar               from '@/components/navigation/Navbar';
import HeroSection          from './sections/HeroSection';
import StatsSection         from './sections/StatsSection';
import ProblemSection       from './sections/ProblemSection';
import SolutionSection      from './sections/SolutionSection';
import FeaturesSection      from './sections/FeaturesSection';
import B2BSaaSSection       from './sections/B2BSaaSSection';
import TechSection          from './sections/TechSection';
import DemoWorkflowSection  from './sections/DemoWorkflowSection';
import TestimonialsSection  from './sections/TestimonialsSection';
import FAQSection           from './sections/FAQSection';
import CTASection           from './sections/CTASection';
import Footer               from './sections/Footer';
import FinancialNetworkEngine from '@/components/common/FinancialNetworkEngine';

export default function Landing() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    // The outer wrapper sets the page background colour; engine sits fixed behind everything.
    <div className="relative min-h-screen bg-white dark:bg-[#050a1a] text-gray-900 dark:text-white transition-colors duration-300">

      {/* ── Full-page animated financial network background ── */}
      <FinancialNetworkEngine />

      {/* ── All content sits in front via relative z-index ── */}
      <div className="relative z-10">
        <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
        <HeroSection />
        <StatsSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <B2BSaaSSection />
        <TechSection />
        <DemoWorkflowSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
