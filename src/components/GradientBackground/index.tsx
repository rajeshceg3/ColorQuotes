import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GradientService, GradientDefinition } from '../../services/GradientService';
import { getReducedMotionDuration } from '../../utils/motion';

const BASE_GRADIENT_TRANSITION_DURATION = 2000;
const GRADIENT_CHANGE_INTERVAL = 15000;
const FALLBACK_GRADIENT_CLASSES = 'bg-gray-800';

const gradientService = GradientService.getInstance();

const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gradients, setGradients] = useState<[GradientDefinition | null, GradientDefinition | null]>(() => {
    const initialBg1 = gradientService.generateGradient();
    const initialBg2 = gradientService.generateGradient(initialBg1);
    return [initialBg1, initialBg2];
  });

  const [activeGradientIndex, setActiveGradientIndex] = useState(0);
  const gradientIntervalRef = useRef<number | null>(null);
  const gradientTransitionDuration = getReducedMotionDuration(BASE_GRADIENT_TRANSITION_DURATION);

  const changeGradient = useCallback(() => {
    const currentActiveGradient = gradients[activeGradientIndex];
    const newGradient = gradientService.generateGradient(currentActiveGradient);

    // Determine which gradient to replace (the non-active one)
    const nextGradientIndex = 1 - activeGradientIndex;

    setGradients(prevGradients => {
      const newGradients = [...prevGradients] as [GradientDefinition | null, GradientDefinition | null];
      newGradients[nextGradientIndex] = newGradient;
      return newGradients;
    });

    setActiveGradientIndex(nextGradientIndex);
  }, [gradients, activeGradientIndex]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      gradientIntervalRef.current = window.setInterval(changeGradient, GRADIENT_CHANGE_INTERVAL);
    }

    return () => {
      if (gradientIntervalRef.current) {
        clearInterval(gradientIntervalRef.current);
      }
    };
  }, [changeGradient]);

  const bgClasses = gradients.map(g =>
    g ? GradientService.formatGradientToTailwind(g) : FALLBACK_GRADIENT_CLASSES
  );

  return (
    <div className="relative min-h-screen w-full">
      <div
        className={`absolute inset-0 ${bgClasses[0]}`}
        style={{
          opacity: activeGradientIndex === 0 ? 1 : 0,
          transition: `opacity ${gradientTransitionDuration}ms ease-in-out`,
        }}
        aria-hidden="true"
      />
      <div
        className={`absolute inset-0 ${bgClasses[1]}`}
        style={{
          opacity: activeGradientIndex === 1 ? 1 : 0,
          transition: `opacity ${gradientTransitionDuration}ms ease-in-out`,
        }}
        aria-hidden="true"
      />
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center isolate">
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;
