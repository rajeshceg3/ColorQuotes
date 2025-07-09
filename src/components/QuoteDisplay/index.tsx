import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote, QuoteCategory } from '../../types'; // Added QuoteCategory
import { QuoteService } from '../../services/QuoteService'; // Import QuoteService
import { getReducedMotionDuration } from '../../utils/motion';
import './QuoteDisplay.css';

const QUOTE_ROTATION_INTERVAL = 30000; // 30 seconds
const BASE_QUOTE_FADE_DURATION = 800;

const quoteService = QuoteService.getInstance(); // Instantiate service

const QuoteDisplay: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(() => quoteService.getRandomQuote());
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const quoteIntervalRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const tooltipTimeoutRef = useRef<number | null>(null);

  const quoteFadeDuration = getReducedMotionDuration(BASE_QUOTE_FADE_DURATION);

  // Update isFavorited state when currentQuote changes
  useEffect(() => {
    if (currentQuote) {
      setIsFavorited(quoteService.isQuoteFavorited(currentQuote.id));
    }
  }, [currentQuote]);

  const changeQuoteContent = useCallback(() => {
    setCurrentQuote(prevQuote => {
      const newQuote = quoteService.getRandomQuote();
      if (newQuote === null && prevQuote !== null) {
        return prevQuote;
      }
      return newQuote;
    });
  }, []);

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


  // Effect for initial load, visibility, and managing the timer
  useEffect(() => {
    if (currentQuote) {
      setIsQuoteVisible(true);
    }

    if (quoteIntervalRef.current) {
      clearInterval(quoteIntervalRef.current);
    }

    quoteIntervalRef.current = window.setInterval(() => {
      animateAndChangeQuote(true); // Trigger animation for timer
    }, QUOTE_ROTATION_INTERVAL);


    // Cleanup on unmount or before effect re-runs
    return () => {
      if (quoteIntervalRef.current) {
        clearInterval(quoteIntervalRef.current);
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [animateAndChangeQuote]);

  const handleInteraction = () => {
    if (isAnimatingRef.current) return;
    animateAndChangeQuote(false); // Manually triggered
  };

  if (!currentQuote) {
    return (
      <p className="text-center text-xl text-white p-10" aria-live="polite">
        No quotes available.
      </p>
    );
  }

  const handleToggleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering next quote
    if (!currentQuote) return;

    const newFavoritedState = !isFavorited;
    setIsFavorited(newFavoritedState);

    if (newFavoritedState) {
      quoteService.addFavorite(currentQuote.id);
    } else {
      quoteService.removeFavorite(currentQuote.id);
    }
  };

  const handleCopyQuote = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering next quote
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.text}" - ${currentQuote.author}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setShowCopyTooltip(true);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      tooltipTimeoutRef.current = window.setTimeout(() => {
        setShowCopyTooltip(false);
      }, 2000); // Hide tooltip after 2 seconds
    } catch (err) {
      console.error('Failed to copy quote: ', err);
      // Optionally, show an error tooltip
    }
  };

  return (
    <div
      className="relative text-center w-full max-w-[600px] p-4 pt-8 bg-muted-dark-canvas rounded-lg cursor-pointer
                 transition-transform transform hover:scale-105 active:scale-100
                 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
      style={{ minHeight: '250px' }} // Increased minHeight for icons
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInteraction(); } }}
      aria-label="Display next quote"
    >
      {/* Icons Container */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={handleToggleFavorite}
          aria-label={isFavorited ? "Unfavorite this quote" : "Favorite this quote"}
          className="p-2 text-2xl text-white hover:text-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400 rounded-full"
          aria-pressed={isFavorited}
        >
          {isFavorited ? '★' : '☆'}
        </button>
        <div className="relative">
          <button
            onClick={handleCopyQuote}
            aria-label="Copy quote and author"
            className="p-2 text-xl text-white hover:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 rounded-full"
          >
            📋
          </button>
          {showCopyTooltip && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-700 text-white text-xs rounded-md">
              Copied!
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          opacity: isQuoteVisible ? 1 : 0,
          transition: `opacity ${quoteFadeDuration}ms ease-in-out`,
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {currentQuote ? (
          <>
            <p
              className="text-quote-sm sm:text-quote-md lg:text-quote-lg font-light text-white font-serif"
              style={{ lineHeight: 1.4, marginTop: '20px' }} // Added marginTop to avoid overlap with icons
            >
              "{currentQuote.text}"
            </p>
            <p
              className="mt-6 text-attrib-sm sm:text-attrib-md lg:text-attrib-lg font-medium text-white font-serif"
              style={{ marginTop: '20px' }}
            >
              - {currentQuote.author}
            </p>
          </>
        ) : (
          <div style={{ minHeight: '100px' }}>
             <p className="text-transparent">&nbsp;</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default QuoteDisplay;