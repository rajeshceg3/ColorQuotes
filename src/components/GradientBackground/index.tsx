import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GradientService, GradientDefinition } from '../../services/GradientService'; // Import service and type
import { getReducedMotionDuration } from '../../utils/motion';

// interface GradientDef { type: string; angle: string; colors: string[]; } // Removed, use GradientDefinition
const BASE_GRADIENT_TRANSITION_DURATION = 2000;
const GRADIENT_CHANGE_INTERVAL = 15000;

// const allGradients: GradientDef[] = gradientData.gradients; // Removed

const gradientService = GradientService.getInstance(); // Instantiate service
const FALLBACK_GRADIENT_CLASSES = 'bg-gray-800'; // Fallback if service returns null

const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Calculate all initial values together before initializing states
  const initialBg1Def = gradientService.generateGradient();
  const initialBg2Def = gradientService.generateGradient(initialBg1Def); // Depends on initialBg1Def

  const initialBg1Classes = initialBg1Def
    ? GradientService.formatGradientToTailwind(initialBg1Def)
    : FALLBACK_GRADIENT_CLASSES;
  const initialBg2Classes = initialBg2Def
    ? GradientService.formatGradientToTailwind(initialBg2Def)
    : FALLBACK_GRADIENT_CLASSES;

  // Store the definition objects and derive classes from them
  const [currentBg1Def, setCurrentBg1Def] = useState<GradientDefinition | null>(initialBg1Def);
  const [currentBg2Def, setCurrentBg2Def] = useState<GradientDefinition | null>(initialBg2Def);

  const [bg1Classes, setBg1Classes] = useState<string>(initialBg1Classes);
  const [bg2Classes, setBg2Classes] = useState<string>(initialBg2Classes);

  const [bg1Opacity, setBg1Opacity] = useState(1);
  const [bg2Opacity, setBg2Opacity] = useState(0);

  const activeBgRef = useRef<1 | 2>(1);
  const gradientIntervalRef = useRef<number | null>(null);
  const gradientTransitionDuration = getReducedMotionDuration(BASE_GRADIENT_TRANSITION_DURATION);

  // Refs to hold the current gradient definitions for use in changeGradient callback
  // This allows changeGradient to not have currentBg1Def/currentBg2Def as dependencies
  // and thus remain stable, preventing useEffect from re-running the interval setup.
  const currentBg1DefRef = useRef(initialBg1Def);
  const currentBg2DefRef = useRef(initialBg2Def);

  useEffect(() => {
    currentBg1DefRef.current = currentBg1Def;
    currentBg2DefRef.current = currentBg2Def;
  }, [currentBg1Def, currentBg2Def]);

  // This function is no longer needed in the same way, service handles selection.
  // const getNewGradientClasses = useCallback((excludeDefinition: GradientDefinition | null): string => {
  //   const newDef = gradientService.generateGradient(excludeDefinition);
  //   if (!newDef) return FALLBACK_GRADIENT_CLASSES; // Or current classes if newDef is null
  //   return GradientService.formatGradientToTailwind(newDef);
  // }, []);

  const changeGradient = useCallback(() => {
    const bg1DefForExclusion = currentBg1DefRef.current;
    const bg2DefForExclusion = currentBg2DefRef.current;

    if (activeBgRef.current === 1) {
      const newDef2 = gradientService.generateGradient(bg1DefForExclusion);
      const currentDef2 = currentBg2DefRef.current;

      // Check if newDef2 is meaningfully different from currentDef2 or if newDef2 is not null and currentDef2 was
      const isDifferent = newDef2 &&
                          (!currentDef2 ||
                           newDef2.angle !== currentDef2.angle ||
                           newDef2.colors.join(',') !== currentDef2.colors.join(','));

      if (isDifferent) {
        setCurrentBg2Def(newDef2); // newDef2 is guaranteed to be non-null here
        setBg2Classes(GradientService.formatGradientToTailwind(newDef2!)); // Use non-null assertion
        setBg1Opacity(0);
        setBg2Opacity(1);
        activeBgRef.current = 2;
      } else if (newDef2 && !currentDef2) {
        // This case handles if currentDef2 was null and newDef2 is the first valid gradient
        setCurrentBg2Def(newDef2);
        setBg2Classes(GradientService.formatGradientToTailwind(newDef2));
        setBg1Opacity(0);
        setBg2Opacity(1);
        activeBgRef.current = 2;
      }
      // If newDef2 is null or same as currentDef2, do nothing, no transition
    } else { // activeBgRef.current === 2
      const newDef1 = gradientService.generateGradient(bg2DefForExclusion);
      const currentDef1 = currentBg1DefRef.current;

      const isDifferent = newDef1 &&
                          (!currentDef1 ||
                           newDef1.angle !== currentDef1.angle ||
                           newDef1.colors.join(',') !== currentDef1.colors.join(','));

      if (isDifferent) {
        setCurrentBg1Def(newDef1); // newDef1 is guaranteed to be non-null here
        setBg1Classes(GradientService.formatGradientToTailwind(newDef1!)); // Use non-null assertion
        setBg1Opacity(1);
        setBg2Opacity(0);
        activeBgRef.current = 1;
      } else if (newDef1 && !currentDef1) {
        // This case handles if currentDef1 was null and newDef1 is the first valid gradient
        setCurrentBg1Def(newDef1);
        setBg1Classes(GradientService.formatGradientToTailwind(newDef1));
        setBg1Opacity(1);
        setBg2Opacity(0);
        activeBgRef.current = 1;
      }
      // If newDef1 is null or same as currentDef1, do nothing, no transition
    }
  }, [gradientService, setCurrentBg1Def, setBg1Classes, setCurrentBg2Def, setBg2Classes, setBg1Opacity, setBg2Opacity, activeBgRef]);

  useEffect(() => {
    // Initial opacities are set via useState.
    // activeBgRef is initialized to 1 by default.
    // Interval management is the primary role of this effect now.

    // Manage interval
    if (gradientIntervalRef.current) clearInterval(gradientIntervalRef.current);
    // The service handles providing gradients; interval runs if service might provide different ones.
    // A check like `gradientService.getAllGradients().length > 1` could be used.
    // For now, always run interval, service ensures different one if possible.
    // Ensure that the effect correctly handles the case where window is not defined (e.g., SSR)
    if (typeof window !== 'undefined') {
      gradientIntervalRef.current = window.setInterval(changeGradient, GRADIENT_CHANGE_INTERVAL);
    }

    return () => {
      if (gradientIntervalRef.current) clearInterval(gradientIntervalRef.current);
    };
  }, [changeGradient]); // changeGradient is the key dependency that might change.

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
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center isolate">
        {children}
      </div>
    </div>
  );
};
export default GradientBackground;
