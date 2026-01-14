import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Quote } from '../../types';
import { QuoteService } from '../../services/QuoteService';
import { getReducedMotionDuration } from '../../utils/motion';
import { usePageVisibility } from '../../utils/usePageVisibility';
import FavoriteIcon from '../Icons/FavoriteIcon';
import CopyIcon from '../Icons/CopyIcon';
import ShareIcon from '../Icons/ShareIcon';
import './QuoteDisplay.css';

const QUOTE_ROTATION_INTERVAL = 30000; // 30 seconds
const BASE_QUOTE_FADE_DURATION = 1000;

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
  }, [quoteService]);

  const animateAndChangeQuote = useCallback((isTriggeredByTimer: boolean = false) => {
    if (isAnimatingRef.current && !isTriggeredByTimer) return;

    isAnimatingRef.current = true;
    setIsQuoteVisible(false); // Start fade-out

    setTimeout(() => {
      changeQuoteContent();
      setIsQuoteVisible(true); // Start fade-in
      isAnimatingRef.current = false;
    }, quoteFadeDuration / 2); // Faster switch
  }, [changeQuoteContent, quoteFadeDuration]);

  // Effect for managing the quote rotation timer
  useEffect(() => {
    if (quoteIntervalRef.current) {
      clearInterval(quoteIntervalRef.current);
    }

    if (isVisible && currentQuote && quoteService) {
      quoteIntervalRef.current = window.setInterval(() => {
        animateAndChangeQuote(true);
      }, QUOTE_ROTATION_INTERVAL);
    }

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
      showToast('Favorited');
    } else {
      quoteService.removeFavorite(currentQuote.id);
      showToast('Unfavorited');
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
        console.error('Share failed:', err);
      }
    } else {
      handleCopyQuote(event);
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-center text-lg md:text-xl text-white/80 p-10 font-medium tracking-wide" aria-live="assertive">
          {error}
        </p>
      </div>
    );
  }

  // Loading state
  if (!currentQuote) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-white/20 rounded w-48 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center items-center px-4 md:px-0">
      <div
        className="glass-card relative w-full md:max-w-4xl min-h-[60vh] md:min-h-[500px] flex flex-col justify-between p-8 md:p-16 rounded-[2.5rem] md:rounded-[3rem] transition-all duration-700 ease-out"
        role="button"
        tabIndex={0}
        onClick={handleInteraction}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleInteraction(); } }}
        aria-label="Display next quote"
      >
        {/* Quote Content */}
        <div
          className="flex-1 flex flex-col items-center justify-center text-center"
          style={{
            opacity: isQuoteVisible ? 1 : 0,
            transform: isQuoteVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
            transition: `opacity ${quoteFadeDuration}ms ease-out, transform ${quoteFadeDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
            filter: isQuoteVisible ? 'blur(0px)' : 'blur(4px)',
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="mb-8 md:mb-12">
             <span className="text-6xl text-white/10 font-serif leading-none select-none">“</span>
          </div>

          <p
            className="text-quote-sm md:text-quote-md lg:text-quote-lg font-semibold text-white tracking-tight leading-snug drop-shadow-sm select-none max-w-prose mx-auto"
          >
            {currentQuote.text}
          </p>

          <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent my-10 md:my-12"></div>

          <p
            className="text-attrib-sm md:text-attrib-md lg:text-attrib-lg font-medium text-white/80 tracking-widest uppercase shadow-black/5 drop-shadow-sm"
          >
            {currentQuote.author}
          </p>
        </div>

        {/* Controls - Mobile: Bottom Bar, Desktop: Floating Bottom Right */}
        <div
            className="
                mt-8 md:mt-0
                flex items-center justify-center md:justify-end
                w-full md:w-auto
                md:absolute md:bottom-10 md:right-10
                pointer-events-none /* Parent is purely layout */
            "
        >
            <div
                className="
                    pointer-events-auto
                    flex items-center space-x-2 md:space-x-4
                    bg-black/20 backdrop-blur-xl
                    rounded-full px-6 py-3 md:px-5 md:py-2.5
                    border border-white/10 shadow-lg
                    transition-transform duration-300 hover:scale-[1.02]
                "
                onClick={(e) => e.stopPropagation()}
            >
                <div className="icon-button p-2 rounded-full cursor-pointer text-white/90 hover:text-white" onClick={handleToggleFavorite} title={isFavorited ? "Unfavorite" : "Favorite"}>
                    <FavoriteIcon isFavorited={isFavorited}  />
                </div>
                <div className="w-px h-5 bg-white/10"></div>
                <div className="icon-button p-2 rounded-full cursor-pointer text-white/90 hover:text-white" onClick={handleCopyQuote} title="Copy to clipboard">
                     <CopyIcon />
                </div>
                <div className="w-px h-5 bg-white/10"></div>
                <div className="icon-button p-2 rounded-full cursor-pointer text-white/90 hover:text-white" onClick={handleShare} title="Share quote">
                     <ShareIcon />
                </div>
            </div>
        </div>
      </div>

      {/* Refined Toast Notification */}
      <div
        className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 cubic-bezier(0.2, 0.8, 0.2, 1) ${
          toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="glass-card bg-white/90 backdrop-blur-2xl text-slate-900 px-8 py-4 rounded-full shadow-2xl font-medium text-sm flex items-center space-x-3 border border-white/40">
           <div className="w-2 h-2 rounded-full bg-ive-blue-1"></div>
           <span className="tracking-wide text-slate-800">{toastMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplay;
