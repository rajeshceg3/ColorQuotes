import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote } from '../../types';
import { QuoteService } from '../../services/QuoteService';
import { getReducedMotionDuration } from '../../utils/motion';
import { usePageVisibility } from '../../utils/usePageVisibility';
import FavoriteIcon from '../Icons/FavoriteIcon';
import CopyIcon from '../Icons/CopyIcon';
import './QuoteDisplay.css';

const QUOTE_ROTATION_INTERVAL = 30000; // 30 seconds
const BASE_QUOTE_FADE_DURATION = 1200;

const QuoteDisplay: React.FC = () => {
  const [quoteService, setQuoteService] = useState<QuoteService | null>(null);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [allQuotesSeen, setAllQuotesSeen] = useState(false);
  const quoteIntervalRef = useRef<number | null>(null);
  const isVisible = usePageVisibility();
  const isAnimatingRef = useRef(false);
  const toastTimeoutRef = useRef<number | null>(null);

  const quoteFadeDuration = getReducedMotionDuration(BASE_QUOTE_FADE_DURATION);

  // Initialize the QuoteService
  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = await QuoteService.getInstance();
        setQuoteService(service);
        setCurrentQuote(service.getRandomQuote());
      } catch (err) {
        console.error('Failed to initialize QuoteService:', err);
        setError('Could not load quotes. Please try again later.');
      }
    };
    initializeService();
  }, []);

  // Update isFavorited state when currentQuote or quoteService changes
  useEffect(() => {
    if (currentQuote && quoteService) {
      setIsFavorited(quoteService.isQuoteFavorited(currentQuote.id));
    }
  }, [currentQuote, quoteService]);

  // Effect to show a toast when all quotes have been seen and the cycle restarts
  useEffect(() => {
    if (allQuotesSeen) {
      showToast("You've seen all quotes! Starting over.");
      setAllQuotesSeen(false); // Reset the trigger
    }
  }, [allQuotesSeen]);

  const changeQuoteContent = useCallback(() => {
    if (!quoteService) return;

    let newQuote = quoteService.getRandomQuote();

    if (newQuote === null) {
      // All quotes have been seen, reset and get a new one.
      setAllQuotesSeen(true); // Trigger feedback
      quoteService.resetViewedQuotes();
      newQuote = quoteService.getRandomQuote(); // Should always return a quote now
    }

    if (newQuote) {
      setCurrentQuote(newQuote);
    }
    // If newQuote is still null (e.g., service failed), we keep the old one.
  }, [quoteService]);

  const animateAndChangeQuote = useCallback((isTriggeredByTimer: boolean = false) => {
    if (isAnimatingRef.current && !isTriggeredByTimer) return;

    isAnimatingRef.current = true;
    setIsQuoteVisible(false); // Start fade-out

    setTimeout(() => {
      changeQuoteContent();
      setIsQuoteVisible(true); // Start fade-in
      isAnimatingRef.current = false;
    }, quoteFadeDuration);
  }, [changeQuoteContent, quoteFadeDuration]);

  // Effect for managing the quote rotation timer
  useEffect(() => {
    // Always clear previous interval
    if (quoteIntervalRef.current) {
      clearInterval(quoteIntervalRef.current);
    }

    // Start timer only if the page is visible and everything is loaded
    if (isVisible && currentQuote && quoteService) {
      quoteIntervalRef.current = window.setInterval(() => {
        animateAndChangeQuote(true);
      }, QUOTE_ROTATION_INTERVAL);
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (quoteIntervalRef.current) {
        clearInterval(quoteIntervalRef.current);
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [currentQuote, quoteService, animateAndChangeQuote, isVisible]);

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
    if (isAnimatingRef.current || !quoteService) return;
    animateAndChangeQuote(false);
  };

  const handleToggleFavorite = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentQuote || !quoteService) return;

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
    event.stopPropagation();
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

  // Error state
  if (error) {
    return (
      <p className="text-center text-xl text-red-400 p-10" aria-live="assertive">
        {error}
      </p>
    );
  }

  // Loading state
  if (!currentQuote) {
    return (
      <p className="text-center text-xl text-white p-10" aria-live="polite">
        Loading quotes...
      </p>
    );
  }

  return (
    <div
      className="relative text-center w-full max-w-[600px] p-4 cursor-pointer min-h-[250px]"
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
      </div>

      {/* Icons Container */}
      <div className="absolute bottom-4 right-4 flex space-x-2 icon-container">
        <FavoriteIcon isFavorited={isFavorited} onClick={handleToggleFavorite} />
        <CopyIcon onClick={handleCopyQuote} />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="toast-notification"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default QuoteDisplay;