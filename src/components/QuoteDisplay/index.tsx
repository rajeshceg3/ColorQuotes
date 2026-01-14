import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote } from '../../types';
import { QuoteService } from '../../services/QuoteService';
import { getReducedMotionDuration } from '../../utils/motion';
import { usePageVisibility } from '../../utils/usePageVisibility';
import FavoriteIcon from '../Icons/FavoriteIcon';
import CopyIcon from '../Icons/CopyIcon';
import ShareIcon from '../Icons/ShareIcon';
import IconButton from '../IconButton';

const QUOTE_ROTATION_INTERVAL = 30000; // 30 seconds
const BASE_QUOTE_FADE_DURATION = 800; // Faster, punchier fade

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
      setAllQuotesSeen(true);
      quoteService.resetViewedQuotes();
      newQuote = quoteService.getRandomQuote();
    }

    if (newQuote) {
      setCurrentQuote(newQuote);
    }
  }, [quoteService]);

  const animateAndChangeQuote = useCallback((isTriggeredByTimer: boolean = false) => {
    if (isAnimatingRef.current && !isTriggeredByTimer) return;

    isAnimatingRef.current = true;
    setIsQuoteVisible(false);

    setTimeout(() => {
      changeQuoteContent();
      setIsQuoteVisible(true);
      isAnimatingRef.current = false;
    }, quoteFadeDuration);
  }, [changeQuoteContent, quoteFadeDuration]);

  useEffect(() => {
    if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);

    if (isVisible && currentQuote && quoteService) {
      quoteIntervalRef.current = window.setInterval(() => {
        animateAndChangeQuote(true);
      }, QUOTE_ROTATION_INTERVAL);
    }

    return () => {
      if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [currentQuote, quoteService, animateAndChangeQuote, isVisible]);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);
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
      showToast('Added to favorites');
    } else {
      quoteService.removeFavorite(currentQuote.id);
      showToast('Removed from favorites');
    }
  };

  const handleCopyQuote = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.text}" - ${currentQuote.author}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy quote: ', err);
      showToast('Failed to copy');
    }
  };

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentQuote) return;
    const text = `"${currentQuote.text}" - ${currentQuote.author}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspirational Quote',
          text: text,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopyQuote(event);
    }
  };

  if (error) {
    return (
      <p className="text-center text-xl text-red-300 p-10 font-medium" aria-live="assertive">
        {error}
      </p>
    );
  }

  if (!currentQuote) {
    return (
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-4 bg-white/20 rounded w-48 mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center" style={{ perspective: '1000px' }}>
      <div
        className={`
          relative w-full max-w-3xl p-6 sm:p-16 rounded-[2rem]
          transition-all duration-500 ease-out
          cursor-pointer
          sm:glass-panel sm:glass-panel-interactive
        `}
        role="button"
        tabIndex={0}
        onClick={handleInteraction}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInteraction(); } }}
        aria-label="Display next quote"
      >
        <div
          className="flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[300px]"
        >
          {/* Quote Text */}
          <div
             className={`transition-all duration-${quoteFadeDuration} ease-out`}
             style={{
               opacity: isQuoteVisible ? 1 : 0,
               transform: isQuoteVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)'
             }}
          >
            <h1
              className={`
                text-3xl sm:text-4xl md:text-5xl lg:text-quote-lg
                font-bold text-white tracking-tighter leading-tight text-center
                text-balance drop-shadow-sm select-none
                ${isQuoteVisible ? 'animate-fade-in-up' : ''}
              `}
            >
              &quot;{currentQuote.text}&quot;
            </h1>

            <div className={`w-16 h-1 bg-white/40 rounded-full mx-auto my-8 sm:my-10 ${isQuoteVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700 delay-100`}></div>

            <p
              className={`
                text-lg sm:text-xl md:text-2xl
                font-medium text-white/90 tracking-widest uppercase text-center
                drop-shadow-sm
                ${isQuoteVisible ? 'animate-fade-in-up-delay-1' : ''}
              `}
            >
              {currentQuote.author}
            </p>
          </div>

          {/* Hint for "Next Quote" - subtle indicator */}
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-sm font-medium tracking-wider uppercase opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
            Click for next quote
          </div>
        </div>

        {/* Desktop Controls (Bottom Right) */}
        <div className="hidden sm:flex absolute bottom-8 right-8 items-center space-x-3 z-10">
          <IconButton
            icon={<FavoriteIcon filled={isFavorited} />}
            onClick={handleToggleFavorite}
            label={isFavorited ? "Unfavorite" : "Favorite"}
            isActive={isFavorited}
          />
          <IconButton
            icon={<CopyIcon />}
            onClick={handleCopyQuote}
            label="Copy quote"
          />
        </div>
      </div>

      {/* Mobile Floating Action Bar (Bottom Center) */}
      <div className="sm:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-bar rounded-full px-6 py-3 flex items-center space-x-6 shadow-2xl border border-white/10">
          <IconButton
            icon={<FavoriteIcon filled={isFavorited} className="w-6 h-6" />}
            onClick={handleToggleFavorite}
            label="Favorite"
            isActive={isFavorited}
            className="w-12 h-12 border-none bg-transparent hover:bg-white/10"
          />

          <div className="w-px h-6 bg-white/20"></div>

          <IconButton
            icon={<ShareIcon />}
            onClick={handleShare}
            label="Share"
            className="w-12 h-12 border-none bg-transparent hover:bg-white/10"
          />
        </div>
      </div>

      {/* Toast Notification */}
      <div
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[60] transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${
          toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="glass-panel bg-white/90 backdrop-blur-xl text-slate-900 px-6 py-3 rounded-full shadow-2xl font-semibold text-sm tracking-wide flex items-center space-x-2 border border-white/40">
          <span>{toastMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplay;
