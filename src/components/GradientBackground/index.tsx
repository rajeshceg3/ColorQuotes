import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GradientService, GradientDefinition } from '../../services/GradientService';
import { getReducedMotionDuration } from '../../utils/motion';
import { usePageVisibility } from '../../utils/usePageVisibility';

const BASE_GRADIENT_TRANSITION_DURATION = 3000; // Slower, more dreamy
const GRADIENT_CHANGE_INTERVAL = 20000; // 20 seconds
const FALLBACK_GRADIENT_CLASSES = 'bg-gray-800';

const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gradientService, setGradientService] = useState<GradientService | null>(null);
  const [gradients, setGradients] = useState<[GradientDefinition | null, GradientDefinition | null]>([null, null]);
  const [activeGradientIndex, setActiveGradientIndex] = useState(0);
  const gradientIntervalRef = useRef<number | null>(null);
  const isVisible = usePageVisibility();
  const gradientTransitionDuration = getReducedMotionDuration(BASE_GRADIENT_TRANSITION_DURATION);

  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = await GradientService.getInstance();
        setGradientService(service);
        const initialBg1 = service.generateGradient();
        const initialBg2 = service.generateGradient(initialBg1);
        setGradients([initialBg1, initialBg2]);
      } catch (err) {
        console.error('Failed to initialize GradientService:', err);
      }
    };
    initializeService();
  }, []);

  const changeGradient = useCallback(() => {
    if (!gradientService) return;
    const currentActiveGradient = gradients[activeGradientIndex];
    const newGradient = gradientService.generateGradient(currentActiveGradient);
    const nextGradientIndex = 1 - activeGradientIndex;

    setGradients(prevGradients => {
      const newGradients = [...prevGradients] as [GradientDefinition | null, GradientDefinition | null];
      newGradients[nextGradientIndex] = newGradient;
      return newGradients;
    });

    setActiveGradientIndex(nextGradientIndex);
  }, [gradients, activeGradientIndex, gradientService]);

  const savedCallback = useRef(changeGradient);

  // Keep the saved callback updated
  useEffect(() => {
    savedCallback.current = changeGradient;
  }, [changeGradient]);

  // Manage the interval
  useEffect(() => {
    if (gradientService && isVisible) {
      const tick = () => savedCallback.current();
      gradientIntervalRef.current = window.setInterval(tick, GRADIENT_CHANGE_INTERVAL);

      return () => {
        if (gradientIntervalRef.current) {
          clearInterval(gradientIntervalRef.current);
        }
      };
    }
  }, [gradientService, isVisible]);

  const bgClasses = gradients.map(g =>
    g ? GradientService.formatGradientToTailwind(g) : FALLBACK_GRADIENT_CLASSES
  );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div
        data-testid="gradient-bg-1"
        className={`absolute inset-0 ${bgClasses[0]}`}
        style={{
          opacity: activeGradientIndex === 0 ? 1 : 0,
          transition: `opacity ${gradientTransitionDuration}ms ease-in-out`,
        }}
        aria-hidden="true"
      />
      <div
        data-testid="gradient-bg-2"
        className={`absolute inset-0 ${bgClasses[1]}`}
        style={{
          opacity: activeGradientIndex === 1 ? 1 : 0,
          transition: `opacity ${gradientTransitionDuration}ms ease-in-out`,
        }}
        aria-hidden="true"
      />
      {/* Refined Noise Texture Overlay - Slightly lower opacity for clarity */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Main Content Wrapper - Ensures full bleed */}
      <div className="relative w-full h-full isolate">
        {children}
      </div>
    </div>
  );
};

export default GradientBackground;
