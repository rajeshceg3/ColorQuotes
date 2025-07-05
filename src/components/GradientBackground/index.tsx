import React, { useState, useEffect, useCallback, useRef } from 'react';
import gradientData from '../../data/gradients.json';
import { getReducedMotionDuration } from '../../utils/motion'; // Import new utility

interface GradientDef { type: string; angle: string; colors: string[]; }
const BASE_GRADIENT_TRANSITION_DURATION = 1500; // Base duration for gradient fade
const GRADIENT_CHANGE_INTERVAL = 15000; // How often the gradient attempts to change

const allGradients: GradientDef[] = gradientData.gradients;

const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bg1Classes, setBg1Classes] = useState<string>('');
  const [bg2Classes, setBg2Classes] = useState<string>('');
  const [bg1Opacity, setBg1Opacity] = useState(1);
  const [bg2Opacity, setBg2Opacity] = useState(0);

  const activeBgRef = useRef<1 | 2>(1);
  const gradientIntervalRef = useRef<number | null>(null);
  // Get potentially reduced duration for transitions
  const gradientTransitionDuration = getReducedMotionDuration(BASE_GRADIENT_TRANSITION_DURATION);

  const getNewGradientClasses = useCallback((excludeClassString: string | null): string => {
    if (!allGradients || allGradients.length === 0) return 'bg-gray-800'; // Fallback
    if (allGradients.length === 1) {
        const g = allGradients[0];
        return `${g.angle} ${g.colors.join(' ')}`;
    }
    let newClasses;
    do {
        const grad = allGradients[Math.floor(Math.random() * allGradients.length)];
        newClasses = `${grad.angle} ${grad.colors.join(' ')}`;
    } while (excludeClassString && newClasses === excludeClassString && allGradients.length > 1);
    return newClasses;
  }, []);

  const changeGradient = useCallback(() => {
    if (activeBgRef.current === 1) {
      setBg2Classes(getNewGradientClasses(bg1Classes));
      setBg1Opacity(0);
      setBg2Opacity(1);
      activeBgRef.current = 2;
    } else {
      setBg1Classes(getNewGradientClasses(bg2Classes));
      setBg1Opacity(1);
      setBg2Opacity(0);
      activeBgRef.current = 1;
    }
  }, [getNewGradientClasses, bg1Classes, bg2Classes]);

  useEffect(() => {
    // Initial setup
    const initialBg1 = getNewGradientClasses(null);
    setBg1Classes(initialBg1);
    setBg1Opacity(1);
    setBg2Classes(getNewGradientClasses(initialBg1)); // Preload second bg
    setBg2Opacity(0);
    activeBgRef.current = 1;

    // Manage interval
    if (gradientIntervalRef.current) clearInterval(gradientIntervalRef.current);
    if (allGradients.length > 1) { // Only rotate if there's more than one gradient
        gradientIntervalRef.current = window.setInterval(changeGradient, GRADIENT_CHANGE_INTERVAL);
    }

    return () => { // Cleanup on unmount
      if (gradientIntervalRef.current) clearInterval(gradientIntervalRef.current);
    };
  // This useEffect's dependencies ensure the interval is correctly reset when necessary.
  // changeGradient depends on bg1Classes/bg2Classes. When they change, changeGradient is redefined.
  // This causes the useEffect to re-run, clearing the old interval and starting a new one.
  }, [changeGradient, getNewGradientClasses]);

  return (
    <div className="relative min-h-screen w-full">
      <div
        className={`absolute inset-0 ${bg1Classes}`}
        style={{
          opacity: bg1Opacity,
          transition: `opacity ${gradientTransitionDuration}ms ease-in-out` // Use potentially reduced duration
        }}
        aria-hidden="true" // Decorative background
      />
      <div
        className={`absolute inset-0 ${bg2Classes}`}
        style={{
          opacity: bg2Opacity,
          transition: `opacity ${gradientTransitionDuration}ms ease-in-out` // Use potentially reduced duration
        }}
        aria-hidden="true" // Decorative background
      />
      {/* Fallback for initial render if classes aren't set, though useEffect should handle it */}
      {(!bg1Classes && !bg2Classes) && <div className="absolute inset-0 bg-gray-700" aria-hidden="true" />}

      <div className="relative min-h-screen w-full flex flex-col items-center justify-center isolate">
        {children}
      </div>
    </div>
  );
};
export default GradientBackground;
