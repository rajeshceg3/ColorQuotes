import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote, QuoteCategory } from '../../types'; // Added QuoteCategory
import { QuoteService } from '../../services/QuoteService'; // Import QuoteService
import { getReducedMotionDuration } from '../../utils/motion';

// const allQuotes: Quote[] = rawQuoteData.quotes; // Removed

// Removed local getRandomQuote
// const getRandomQuote = (): Quote | null => {
// if (!allQuotes || allQuotes.length === 0) return null;
// const randomIndex = Math.floor(Math.random() * allQuotes.length);
// return allQuotes[randomIndex];
// };

const QUOTE_ROTATION_INTERVAL = 30000; // 30 seconds
const BASE_QUOTE_FADE_DURATION = 800;

const quoteService = QuoteService.getInstance(); // Instantiate service

const QuoteDisplay: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(() => quoteService.getRandomQuote());
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const quoteIntervalRef = useRef<number | null>(null);
  const tooltipTimeoutRef = useRef<number | null>(null); // Ref for the tooltip timeout
  // For now, !isQuoteVisible during the timeout period serves a similar purpose for blocking clicks.
  const isAnimatingRef = useRef(false);

  const quoteFadeDuration = getReducedMotionDuration(BASE_QUOTE_FADE_DURATION);

  // Update isFavorited state when currentQuote changes
  useEffect(() => {
    if (currentQuote) {
      setIsFavorited(quoteService.isQuoteFavorited(currentQuote.id));
    }
  }, [currentQuote]);

  // Effect to clear tooltip timeout on change or unmount
  useEffect(() => {
    // Cleanup function to clear the timeout
    return () => {
      if (tooltipTimeoutRef.current !== null) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [showCopyTooltip]); // Runs when showCopyTooltip changes or component unmounts

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
      // setIsFavorited(quoteService.isQuoteFavorited(currentQuote.id)); // Moved to separate useEffect
    }

    if (quoteIntervalRef.current) {
      clearInterval(quoteIntervalRef.current);
    }

    // Setup new interval. The service will handle cases where few quotes are available.
    // We can check if quoteService has more than one quote to decide to set interval.
    // For now, let's assume the interval is always set and `animateAndChangeQuote` handles nulls.
    // A more robust way: check quoteService.getQuotes(2).length > 1 or similar.
    // Let's keep the interval running. If getRandomQuote returns null, UI handles it.
    quoteIntervalRef.current = window.setInterval(() => {
      animateAndChangeQuote(true); // Trigger animation for timer
    }, QUOTE_ROTATION_INTERVAL);


    // Cleanup on unmount or before effect re-runs
    return () => {
      if (quoteIntervalRef.current) {
        clearInterval(quoteIntervalRef.current);
      }
    };
  }, [animateAndChangeQuote, currentQuote]); // Added currentQuote back to ensure interval restarts if quote somehow changes externally, though unlikely with current setup.

  const handleInteraction = () => {
    if (isAnimatingRef.current) return;
    animateAndChangeQuote(false); // Manually triggered
  };

  // Loading state is removed as currentQuote should be initialized.
  // A check for !currentQuote can still be useful for the empty allQuotes case.
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

    // Use the isFavorited state as the source of truth
    if (isFavorited) {
      quoteService.removeFavorite(currentQuote.id);
      setIsFavorited(false);
    } else {
      // Assuming addFavorite can work with ID if the quote context is clear,
      // or it might expect the full currentQuote object.
      // For consistency with removeFavorite, using ID.
      // If QuoteService.addFavorite expects a Quote object:
      // quoteService.addFavorite(currentQuote);
      quoteService.addFavorite(currentQuote.id); // Or currentQuote if the service API requires
      setIsFavorited(true);
    }
  };

  const handleCopyQuote = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering next quote
    if (!currentQuote) return;
    const quoteTextToCopy = `"${currentQuote.text}" - ${currentQuote.author}`;
    try {
      await navigator.clipboard.writeText(quoteTextToCopy);
      setShowCopyTooltip(true);
      // Clear any existing timeout before setting a new one
      if (tooltipTimeoutRef.current !== null) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      tooltipTimeoutRef.current = window.setTimeout(() => {
        setShowCopyTooltip(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy quote: ', err);
      // Optionally, show an error tooltip
    }
  };

  return (
    <div
      className="relative text-center w-full max-w-[600px] p-4 pt-8 bg-black bg-opacity-25 rounded-lg cursor-pointer
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
            <span className="absolute top-full mt-1 right-0 bg-black text-white text-xs px-2 py-1 rounded">
              Copied!
            </span>
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
              className="text-quote-sm sm:text-quote-md lg:text-quote-lg font-light text-white"
              style={{ lineHeight: 1.4, marginTop: '20px' }} // Added marginTop to avoid overlap with icons
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
          <div style={{ minHeight: '100px' }}>
             <p className="text-transparent">&nbsp;</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default QuoteDisplay;
