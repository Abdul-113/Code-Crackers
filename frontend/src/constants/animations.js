// Centralized Framer Motion animation variants
// Import from here throughout the landing page

export const fadeUp = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeDown = {
  hidden:  { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

export const fadeLeft = {
  hidden:  { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeRight = {
  hidden:  { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerContainer = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export const staggerContainerFast = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerContainerSlow = {
  hidden:  {},
  visible: {
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
};

export const floatAnimation = {
  y:          [0, -16, 0],
  transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
};

export const floatAnimationSlow = {
  y:          [0, -10, 0],
  transition: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
};

export const pulseGlow = {
  opacity:    [0.5, 1, 0.5],
  scale:      [1, 1.05, 1],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

export const hoverLift = {
  whileHover: { y: -6, transition: { duration: 0.2 } },
};
