import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote } from '../../types'; // Added QuoteCategory
import { QuoteService } from '../../services/QuoteService'; // Import QuoteService
import { getReducedMotionDuration } from '../../utils/motion';
import FavoriteIcon from '../Icons/FavoriteIcon';
import CopyIcon from '../Icons/CopyIcon';
import './QuoteDisplay.css';

const QUOTE_ROTATION_INTERVAL = 30000; // 30 seconds
const BASE_QUOTE_FADE_DURATION = 1200;

const quoteService = QuoteService.getInstance(); // Instantiate service

const QuoteDisplay: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(() => quoteService.getRandomQuote());
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const quoteIntervalRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);
  const tooltipTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

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
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [animateAndChangeQuote]);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

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
      showToast('Favorited!');
    } else {
      quoteService.removeFavorite(currentQuote.id);
      showToast('Unfavorited');
    }
  };

  const handleCopyQuote = async (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering next quote
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.text}" - ${currentQuote.author}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Copied!');
    } catch (err) {
      console.error('Failed to copy quote: ', err);
      showToast('Failed to copy');
    }
  };

  return (
    <div
      className="relative text-center w-full max-w-[600px] p-4 cursor-pointer"
      style={{ minHeight: '250px' }}
      onClick={handleInteraction}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInteraction(); } }}
      aria-label="Display next quote"
    >
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
              className="text-2xl sm:text-3xl lg:text-4xl font-light text-white"
              style={{ lineHeight: 1.5, textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              &quot;{currentQuote.text}&quot;
            </p>
            <p
              className="mt-6 text-lg sm:text-xl lg:text-2xl font-medium text-white"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
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

      {/* Icons Container */}
      <div className="absolute bottom-4 right-4 flex space-x-2 icon-container">
        <FavoriteIcon isFavorited={isFavorited} onClick={handleToggleFavorite} />
        <CopyIcon onClick={handleCopyQuote} />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
export default QuoteDisplay;