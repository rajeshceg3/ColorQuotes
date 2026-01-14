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
    <div className="relative w-full flex justify-center">
      <div
        className="glass-card relative w-full max-w-2xl p-8 md:p-12 rounded-3xl transition-all duration-500"
        role="button"
        tabIndex={0}
        onClick={handleInteraction}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInteraction(); } }}
        aria-label="Display next quote"
      >
        <div
          className="flex flex-col items-center justify-center min-h-[300px]"
          style={{
            opacity: isQuoteVisible ? 1 : 0,
            transform: isQuoteVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity ${quoteFadeDuration}ms ease-out, transform ${quoteFadeDuration}ms ease-out`,
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          <p
            className="text-3xl md:text-5xl font-semibold text-white tracking-tight leading-tight text-center drop-shadow-sm select-none"
          >
            &quot;{currentQuote.text}&quot;
          </p>
          <div className="w-12 h-1 bg-white/30 rounded-full my-8"></div>
          <p
            className="text-xl md:text-2xl font-medium text-white/90 tracking-wide uppercase text-center drop-shadow-sm"
          >
            {currentQuote.author}
          </p>
        </div>

        {/* Floating Action Bar */}
        <div className="absolute bottom-6 right-6 flex items-center space-x-3 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg">
          <FavoriteIcon isFavorited={isFavorited} onClick={handleToggleFavorite} />
          <div className="w-px h-4 bg-white/20"></div>
          <CopyIcon onClick={handleCopyQuote} />
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-full shadow-xl font-medium text-sm flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplay;