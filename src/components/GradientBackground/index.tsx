import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GradientService, GradientDefinition } from '../../services/GradientService'; // Import service and type
import { getReducedMotionDuration } from '../../utils/motion';

// interface GradientDef { type: string; angle: string; colors: string[]; } // Removed, use GradientDefinition
const BASE_GRADIENT_TRANSITION_DURATION = 1500;
const GRADIENT_CHANGE_INTERVAL = 15000;

// const allGradients: GradientDef[] = gradientData.gradients; // Removed

const gradientService = GradientService.getInstance(); // Instantiate service
const FALLBACK_GRADIENT_CLASSES = 'bg-gray-800'; // Fallback if service returns null

const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store the definition objects and derive classes from them
  const [currentBg1Def, setCurrentBg1Def] = useState<GradientDefinition | null>(() => gradientService.generateGradient());
  const [currentBg2Def, setCurrentBg2Def] = useState<GradientDefinition | null>(() => gradientService.generateGradient(currentBg1Def));

  const [bg1Classes, setBg1Classes] = useState<string>(() =>
    currentBg1Def ? GradientService.formatGradientToTailwind(currentBg1Def) : FALLBACK_GRADIENT_CLASSES
  );
  const [bg2Classes, setBg2Classes] = useState<string>(() =>
    currentBg2Def ? GradientService.formatGradientToTailwind(currentBg2Def) : FALLBACK_GRADIENT_CLASSES
  );

  const [bg1Opacity, setBg1Opacity] = useState(1);
  const [bg2Opacity, setBg2Opacity] = useState(0);

  const activeBgRef = useRef<1 | 2>(1);
  const gradientIntervalRef = useRef<number | null>(null);
  const gradientTransitionDuration = getReducedMotionDuration(BASE_GRADIENT_TRANSITION_DURATION);

  // This function is no longer needed in the same way, service handles selection.
  // const getNewGradientClasses = useCallback((excludeDefinition: GradientDefinition | null): string => {
  //   const newDef = gradientService.generateGradient(excludeDefinition);
  //   if (!newDef) return FALLBACK_GRADIENT_CLASSES; // Or current classes if newDef is null
  //   return GradientService.formatGradientToTailwind(newDef);
  // }, []);

  const changeGradient = useCallback(() => {
    if (activeBgRef.current === 1) {
      const newDef2 = gradientService.generateGradient(currentBg1Def);
      if (newDef2) { // Only update if a new gradient is found
        setCurrentBg2Def(newDef2);
        setBg2Classes(GradientService.formatGradientToTailwind(newDef2));
      }
      // If newDef2 is null, bg2Classes retains its previous value.
      // The fade will still happen, potentially to the same gradient if no new one was found.
      setBg1Opacity(0);
      setBg2Opacity(1);
      activeBgRef.current = 2;
    } else {
      const newDef1 = gradientService.generateGradient(currentBg2Def);
      if (newDef1) {
        setCurrentBg1Def(newDef1);
        setBg1Classes(GradientService.formatGradientToTailwind(newDef1));
      }
      setBg1Opacity(1);
      setBg2Opacity(0);
      activeBgRef.current = 1;
    }
  }, [currentBg1Def, currentBg2Def]); // Dependencies: the current definitions

  useEffect(() => {
    // Initial setup: bg1Def is set, derive its classes. Preload bg2Def and its classes.
    const initialBg1Def = gradientService.generateGradient();
    setCurrentBg1Def(initialBg1Def);
    setBg1Classes(initialBg1Def ? GradientService.formatGradientToTailwind(initialBg1Def) : FALLBACK_GRADIENT_CLASSES);
    setBg1Opacity(1);

    const initialBg2Def = gradientService.generateGradient(initialBg1Def);
    setCurrentBg2Def(initialBg2Def);
    setBg2Classes(initialBg2Def ? GradientService.formatGradientToTailwind(initialBg2Def) : FALLBACK_GRADIENT_CLASSES);
    setBg2Opacity(0);

    activeBgRef.current = 1;

    // Manage interval
    if (gradientIntervalRef.current) clearInterval(gradientIntervalRef.current);
    // The service handles providing gradients; interval runs if service might provide different ones.
    // A check like `gradientService.getAllGradients().length > 1` could be used.
    // For now, always run interval, service ensures different one if possible.
    gradientIntervalRef.current = window.setInterval(changeGradient, GRADIENT_CHANGE_INTERVAL);

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
