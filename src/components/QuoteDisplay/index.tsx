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
const BASE_QUOTE_FADE_DURATION = 1200;

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
  const progressIntervalRef = useRef<number | null>(null);
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
        setCurrentQuote(service.getRandomQuote());
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

  // Manage Timer & Progress
  useEffect(() => {
    if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    if (isVisible && currentQuote && quoteService) {
      startTimeRef.current = Date.now();

      // Main rotation timer
      quoteIntervalRef.current = window.setInterval(() => {
        animateAndChangeQuote(true);
      }, QUOTE_ROTATION_INTERVAL);

      // Smooth progress bar update (60fps) - Direct DOM manipulation for performance
      progressIntervalRef.current = window.setInterval(() => {
        if (!progressBarRef.current) return;

        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / QUOTE_ROTATION_INTERVAL) * 100, 100);

        // Direct DOM update avoids React re-renders
        progressBarRef.current.style.width = `${newProgress}%`;
      }, 16);
    }

    return () => {
      if (quoteIntervalRef.current) clearInterval(quoteIntervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
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
      showToast('Added to Favorites');
    } else {
      quoteService.removeFavorite(currentQuote.id);
      showToast('Removed from Favorites');
    }
  };

  const handleShare = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentQuote) return;
    const text = `"${currentQuote.text}" — ${currentQuote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Inspiration', text: text });
      } catch (err) { /* ignore dismissals */ }
    } else {
      handleCopyQuote(event);
    }
  };

  const handleCopyQuote = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.text}" — ${currentQuote.author}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Copied to Clipboard');
    } catch (err) {
      showToast('Failed to copy');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <p className="glass-dock px-8 py-4 rounded-xl text-white/90 font-medium">{error}</p>
      </div>
    );
  }

  if (!currentQuote) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
         {/* Elegant loading spinner or skeleton could go here */}
      </div>
    );
  }

  return (
    <>
        {/*
            LAYOUT CONTAINER
            Mobile: Full viewport height (100dvh) for immersive feel.
            Desktop: Centered with breathing room.
        */}
        <div
            className="
                relative w-full
                min-h-[100dvh] md:min-h-screen
                flex flex-col items-center justify-center
                overflow-hidden
            "
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >

            {/*
                THE CARD
                Mobile: Full width/height minus padding, centered.
                Desktop: Elegant floating card with 3D tilt.
            */}
            <div
                ref={cardRef}
                className="
                    glass-card relative
                    w-full h-full md:w-auto md:h-auto
                    md:min-w-[56rem] md:max-w-6xl md:aspect-[16/10]
                    flex flex-col justify-center items-center
                    p-6 md:p-24
                    md:rounded-[3rem]
                    cursor-pointer
                    select-none
                    md:animate-float-slow
                    border-x-0 md:border-x border-y-0 md:border-y md:border-white/10
                    shadow-none md:shadow-glass-pro
                    focus:outline-none focus:ring-2 focus:ring-white/30
                "
                style={{
                  transform: `perspective(1000px) rotateX(${-tilt.y}deg) rotateY(${tilt.x}deg)`,
                  transition: 'transform 0.1s ease-out'
                }}
                onClick={handleInteraction}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-label="Click to show next quote"
            >
                {/* Content Container */}
                <div
                    className="flex flex-col items-center text-center max-w-5xl mx-auto z-10"
                    style={{
                        opacity: isQuoteVisible ? 1 : 0,
                        transform: isQuoteVisible ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.98)',
                        filter: isQuoteVisible ? 'blur(0px)' : 'blur(10px)',
                        transition: `all ${quoteFadeDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`
                    }}
                >
                    {/* Decorative Quote Mark */}
                    <div className={`mb-6 md:mb-10 text-white/20 text-6xl md:text-9xl font-serif leading-none opacity-50 ${isQuoteVisible ? 'animate-stagger-text delay-0' : ''}`}>“</div>

                    {/* Quote Text - Hyper-optimized typography */}
                    <h1 className={`
                        text-3xl md:text-5xl lg:text-[4.5rem]
                        font-semibold text-white tracking-tight leading-tight
                        text-glow drop-shadow-2xl
                        px-4 md:px-0
                        ${isQuoteVisible ? 'animate-stagger-text delay-100' : ''}
                    `}>
                        {currentQuote.text}
                    </h1>

                    {/* Divider */}
                    <div className={`
                        w-16 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent my-8 md:my-14 opacity-60
                        ${isQuoteVisible ? 'animate-stagger-text delay-200' : ''}
                    `}></div>

                    {/* Author */}
                    <p className={`
                        text-sm md:text-lg
                        font-medium text-white/90 tracking-[0.2em] uppercase
                        bg-white/5 px-6 py-2 rounded-full backdrop-blur-md
                        border border-white/10
                        shadow-lg
                        ${isQuoteVisible ? 'animate-stagger-text delay-300' : ''}
                    `}>
                        {currentQuote.author}
                    </p>
                </div>

                {/* Progress Bar (Attached to card bottom for Desktop, top for Mobile?) */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] md:h-1 bg-white/5 overflow-hidden md:rounded-b-[3rem]">
                    <div
                        ref={progressBarRef}
                        className="h-full bg-white/50 shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-75 ease-linear"
                        style={{ width: '0%' }}
                    />
                </div>
            </div>

            {/*
                CONTROLS DOCK
                Mobile: Fixed bottom bar.
                Desktop: Floating pill below the card.
            */}
            <div className="
                fixed bottom-8 md:bottom-12
                z-30
                w-full md:w-auto
                flex justify-center
                pointer-events-none /* Let clicks pass through around the dock */
            ">
                <div className="
                    glass-dock pointer-events-auto
                    flex items-center space-x-6 md:space-x-10
                    px-8 py-4 md:px-12 md:py-6
                    rounded-full
                    transition-all duration-300
                    hover:bg-black/40 hover:scale-105 hover:border-white/25
                    shadow-2xl
                ">
                    <button
                        className="icon-button text-white/70 hover:text-white"
                        onClick={handleToggleFavorite}
                        title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                        aria-label={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
                    >
                        <FavoriteIcon isFavorited={isFavorited} className="w-6 h-6 md:w-8 md:h-8" />
                    </button>

                    <div className="w-px h-6 md:h-8 bg-white/10"></div>

                    <button
                        className="icon-button text-white/70 hover:text-white"
                        onClick={handleCopyQuote}
                        title="Copy to Clipboard"
                        aria-label="Copy to Clipboard"
                    >
                        <CopyIcon className="w-6 h-6 md:w-8 md:h-8" />
                    </button>

                    <div className="w-px h-6 md:h-8 bg-white/10"></div>

                    <button
                        className="icon-button text-white/70 hover:text-white"
                        onClick={handleShare}
                        title="Share"
                        aria-label="Share"
                    >
                        <ShareIcon className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </div>
            </div>

            {/* Toast Notification */}
            <div
                className={`
                    fixed top-12 left-1/2 -translate-x-1/2 z-50
                    transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)
                    ${toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
                `}
            >
                <div className="
                    glass-dock px-6 py-3 rounded-full
                    flex items-center space-x-3
                    bg-white/95 text-slate-900 border-white/50 shadow-2xl
                ">
                    <div className="w-2 h-2 rounded-full bg-ive-blue-1 animate-pulse"></div>
                    <span className="text-sm font-semibold tracking-wide">{toastMessage}</span>
                </div>
            </div>
        </div>
    </>
  );
};

export default QuoteDisplay;
