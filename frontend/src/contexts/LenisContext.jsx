import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const LenisContext = createContext(null);

/**
 * Reusable hook to access the active Lenis instance for scroll animations, 
 * scroll triggers, or custom scroll behaviors.
 */
export const useLenis = () => useContext(LenisContext);

/**
 * Global provider to apply smooth scrolling across the entire application workspace.
 */
export function LenisProvider({ children }) {
  const [lenis, setLenis] = useState(null);
  const location = useLocation();
  const rafRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis with premium settings
    const instance = new Lenis({
      duration: 1.2,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    setLenis(instance);

    // Setup RAF loop
    const raf = (time) => {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      instance.destroy();
    };
  }, []);

  // Reset scroll position on route changes
  useEffect(() => {
    if (lenis) {
      // Smoothly scroll to the top of the viewport when changing pages
      lenis.scrollTo(0, { immediate: false });
    }
  }, [location.pathname, lenis]);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}
