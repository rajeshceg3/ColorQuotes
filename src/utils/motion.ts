// src/utils/motion.ts
export const getReducedMotionDuration = (duration: number): number => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 0;
  }
  return duration;
};
