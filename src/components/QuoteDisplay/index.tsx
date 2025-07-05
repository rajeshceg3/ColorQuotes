import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote } from '../../types';
import rawQuoteData from '../../data/quotes.json';
import { getReducedMotionDuration } from '../../utils/motion'; // Import new utility

const allQuotes: Quote[] = rawQuoteData.quotes;
const QUOTE_ROTATION_INTERVAL = 30000; // 30 seconds
const BASE_QUOTE_FADE_DURATION = 800; // PRD: 0.8s total fade duration (e.g. 400ms out, 400ms in)
                                      // For a single opacity transition, this is the total time.
                                      // The prompt uses 400ms for one part. Let's use PRD's 0.8s for the CSS transition.

const QuoteDisplay: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [isQuoteVisible, setIsQuoteVisible] = useState(true); // Controls opacity for fade
  const quoteIntervalRef = useRef<number | null>(null);
  // isAnimatingRef can be helpful if animations become more complex than just opacity
  // For now, !isQuoteVisible during the timeout period serves a similar purpose for blocking clicks.
  // Let's add it as per prompt to see its role.
  const isAnimatingRef = useRef(false);


  const quoteFadeDuration = getReducedMotionDuration(BASE_QUOTE_FADE_DURATION);

  // Function to pick a new quote and update state
  const changeQuoteContent = useCallback(() => {
    setCurrentQuote(prevQuote => { // Use functional update for setCurrentQuote
      if (allQuotes.length === 0) return null;
      if (allQuotes.length === 1) return allQuotes[0];

      let newQuote;
      do {
        newQuote = allQuotes[Math.floor(Math.random() * allQuotes.length)];
      } while (newQuote.id === prevQuote?.id); // Ensure different from previous quote
      return newQuote;
    });
  }, []); // No direct dependency on currentQuote here, functional update handles it.

  // Function to handle the fade animation and content change
  const animateAndChangeQuote = useCallback((isTriggeredByTimer: boolean = false) => {
    // Prevent starting a new animation if one is already in progress (manual trigger)
    if (isAnimatingRef.current && !isTriggeredByTimer) return;

    isAnimatingRef.current = true;
    setIsQuoteVisible(false); // Start fade-out

    setTimeout(() => {
      changeQuoteContent();
      setIsQuoteVisible(true); // Start fade-in
      isAnimatingRef.current = false;
    }, quoteFadeDuration); // Use the potentially reduced duration

  }, [changeQuoteContent, quoteFadeDuration]);


  // Effect for initial load and managing the timer
  useEffect(() => {
    if (!currentQuote && allQuotes.length > 0) {
      // Initial load: select quote directly without fade
      const randomIndex = Math.floor(Math.random() * allQuotes.length);
      setCurrentQuote(allQuotes[randomIndex]);
      setIsQuoteVisible(true); // Ensure it's visible initially
    }

    // Clear previous interval
    if (quoteIntervalRef.current) {
      clearInterval(quoteIntervalRef.current);
    }

    // Setup new interval if there are multiple quotes
    if (allQuotes.length > 1) {
      quoteIntervalRef.current = window.setInterval(() => {
        animateAndChangeQuote(true); // Trigger animation for timer
      }, QUOTE_ROTATION_INTERVAL);
    }

    // Cleanup on unmount or before effect re-runs
    return () => {
      if (quoteIntervalRef.current) {
        clearInterval(quoteIntervalRef.current);
      }
    };
  }, [currentQuote, animateAndChangeQuote]); // Timer resets when currentQuote changes

  const handleInteraction = () => {
    if (isAnimatingRef.current) return;
    animateAndChangeQuote(false); // Manually triggered
  };

  // ARIA live region for loading state
  if (!currentQuote && isQuoteVisible && !isAnimatingRef.current) {
    return (
      <p className="text-center text-xl text-white p-10" aria-live="polite">
        Loading inspiration...
      </p>
    );
  }

  return (
    <div
      className="text-center w-full max-w-xl p-4 bg-black bg-opacity-10 rounded-lg cursor-pointer
                 transition-transform transform hover:scale-105 active:scale-100
                 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75" // Added focus styles
      style={{ minHeight: '200px' }}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInteraction(); } }}
      aria-label="Display next quote" // ARIA label for the button
    >
      <div
        style={{
          opacity: isQuoteVisible ? 1 : 0,
          transition: `opacity ${quoteFadeDuration}ms ease-in-out`, // Use potentially reduced duration
        }}
        aria-live="polite"  // Announce changes to screen readers
        aria-atomic="true"   // Announce the entire region as a whole
      >
        {currentQuote ? (
          <>
            <p
              className="text-quote-sm sm:text-quote-md lg:text-quote-lg font-light text-white"
              style={{ lineHeight: 1.4 }}
            >
              "{currentQuote.text}"
            </p>
            <p
              className="mt-6 text-attrib-sm sm:text-attrib-md lg:text-attrib-lg font-medium text-white"
              style={{ marginTop: '20px' }}
            >
              - {currentQuote.author}
            </p>
          </>
        ) : (
          // Placeholder to maintain height during fade when currentQuote might be briefly null
          // Also ensures aria-live region has content to announce if it becomes empty.
          // The prompt used text-transparent h-10. Let's ensure consistent height.
          // An actual min-height on the inner div might be better if text length varies a lot.
          <div style={{ minHeight: '100px' }}> {/* Estimate based on typical quote size */}
             <p className="text-transparent">&nbsp;</p> {/* Screen reader might read "blank" or skip. */}
          </div>
        )}
      </div>
    </div>
  );
};
export default QuoteDisplay;
