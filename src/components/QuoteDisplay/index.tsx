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

  // 3D Tilt State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const quoteIntervalRef = useRef<number | null>(null);
  const progressAnimationFrameRef = useRef<number | null>(null);
  const isVisible = usePageVisibility();
  const isAnimatingRef = useRef(false);
  const toastTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const quoteFadeDuration = getReducedMotionDuration(BASE_QUOTE_FADE_DURATION);

  // Initialize the QuoteService
  useEffect(() => {
    const initializeService = async () => {
      try {
        const service = await QuoteService.getInstance();
        setQuoteService(service);
        let quote = service.getRandomQuote();
        if (!quote) {
          service.resetViewedQuotes();
          quote = service.getRandomQuote();
        }
        if (quote) {
          setCurrentQuote(quote);
        } else {
          setError('No quotes available.');
        }
      } catch (err) {
        console.error('Failed to initialize QuoteService:', err);
        setError('Could not load quotes. Please try again later.');
      }
    };
    initializeService();
  }, []);

  // Update isFavorited state
  useEffect(() => {
    if (currentQuote && quoteService) {
      setIsFavorited(quoteService.isQuoteFavorited(currentQuote.id));
    }
  }, [currentQuote, quoteService]);

  // Toast for all quotes seen
  useEffect(() => {
    if (allQuotesSeen) {
      showToast("Cycle complete. Starting fresh.");
      setAllQuotesSeen(false);
    }
  }, [allQuotesSeen]);

  // Handle 3D Tilt on Desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 768) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25; // Division controls sensitivity
    const y = (e.clientY - top - height / 2) / 25;

    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

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
      // Reset timer start time
      startTimeRef.current = Date.now();
      if (progressBarRef.current) progressBarRef.current.style.width = '0%';
    } else {
      setError('No quotes available.');
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
    }, quoteFadeDuration / 2);
  }, [changeQuoteContent, quoteFadeDuration]);

  useEffect(() => {
    if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
    if (progressAnimationFrameRef.current) cancelAnimationFrame(progressAnimationFrameRef.current);

    if (isVisible && currentQuote && quoteService) {
      startTimeRef.current = Date.now();

      // Main rotation timer
      quoteIntervalRef.current = window.setInterval(() => {
        animateAndChangeQuote(true);
      }, QUOTE_ROTATION_INTERVAL);

      // Smooth progress bar update using requestAnimationFrame
      const updateProgress = () => {
        if (!progressBarRef.current) return;

        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / QUOTE_ROTATION_INTERVAL) * 100, 100);

        progressBarRef.current.style.width = `${newProgress}%`;

        if (isVisible) { // Only continue if visible
             progressAnimationFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      progressAnimationFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
      if (progressAnimationFrameRef.current) cancelAnimationFrame(progressAnimationFrameRef.current);
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleInteraction();
    }
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
    const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}`;
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
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inspirational Quote',
          text: text,
        });
      } catch (err) {
        console.warn('Error sharing, falling back to copy:', err);
        handleCopyQuote(event);
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
    <div
      className="relative w-full flex justify-center"
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className={`
          relative w-full max-w-3xl p-6 sm:p-16 rounded-[2rem]
          transition-all duration-500 ease-out
          cursor-pointer
          sm:glass-panel sm:glass-panel-interactive
        `}
        style={{
          transform: `rotateX(${-tilt.y}deg) rotateY(${tilt.x}deg)`,
        }}
      >
        <button
          type="button"
          className="absolute inset-0 w-full h-full z-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-[2rem] bg-transparent border-none"
          onClick={handleInteraction}
          onKeyDown={handleKeyDown}
          aria-label="Display next quote"
        />

        <div
          className="relative z-10 pointer-events-none flex flex-col items-center justify-center min-h-[40vh] sm:min-h-[300px] pb-32 sm:pb-0"
        >
          {/* Quote Text */}
          <div
             className={`transition-all duration-${quoteFadeDuration} ease-out`}
             style={{
               opacity: isQuoteVisible ? 1 : 0,
               transform: isQuoteVisible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)'
             }}
             aria-live="polite"
             aria-atomic="true"
          >
            <h1
              className={`
                text-3xl sm:text-4xl md:text-5xl lg:text-quote-lg
                font-serif font-bold text-white tracking-tighter leading-tight text-center
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
                drop-shadow-sm select-none
                ${isQuoteVisible ? 'animate-fade-in-up-delay-1' : ''}
              `}
            >
              — {currentQuote.author}
            </p>
          </div>

          {/* Hint for "Next Quote" - subtle indicator */}
          <div className={`absolute bottom-40 sm:bottom-8 left-1/2 -translate-x-1/2 text-white drop-shadow-md text-sm font-medium tracking-wider uppercase sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}>
            <span className="sm:hidden">Tap for next quote</span>
            <span className="hidden sm:inline">Click for next quote</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden rounded-b-[2rem]">
            <div
                ref={progressBarRef}
                className="h-full bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-75 ease-linear"
                style={{ width: '0%' }}
            />
        </div>

        {/* Desktop Controls (Bottom Right) */}
        <div className="hidden sm:flex absolute bottom-8 right-8 items-center space-x-3 z-20 pointer-events-auto">
          <IconButton
            icon={<FavoriteIcon isFavorited={isFavorited} />}
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
            icon={<FavoriteIcon isFavorited={isFavorited} className="w-6 h-6" />}
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
