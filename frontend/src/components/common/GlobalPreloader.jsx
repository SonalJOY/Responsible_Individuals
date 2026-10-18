import React, { useState, useEffect, useRef } from 'react';
import riLogo from '../../assets/ri-logo.png';
import { PRELOADER_QUOTES, getNextQuote } from '../../data/preloaderQuotes';

/**
 * GlobalPreloader Component:
 * Full-screen calm, purposeful NGO preloader featuring:
 * - Transparent official Responsible Individuals NGO logo
 * - Smooth repeating logo fade-in/fade-out breathing animation
 * - Short inspirational quotes about volunteering & compassion with smooth cross-fade
 * - Subtle secondary loading progress beam
 * - Full accessibility and reduced motion support
 */
export default function GlobalPreloader({
  isLoading = true,
  isExiting = false,
  message = 'Loading Responsible Individuals platform...',
}) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => Math.floor(Math.random() * PRELOADER_QUOTES.length));
  const [isQuoteTransitioning, setIsQuoteTransitioning] = useState(false);
  const quoteTimerRef = useRef(null);

  // Gentle quote transition every 3.8s if loading remains active
  useEffect(() => {
    if (!isLoading || isExiting) return;

    quoteTimerRef.current = setInterval(() => {
      setIsQuoteTransitioning(true);
      setTimeout(() => {
        const next = getNextQuote(currentQuoteIndex);
        setCurrentQuoteIndex(next.index);
        setIsQuoteTransitioning(false);
      }, 350);
    }, 3800);

    return () => {
      if (quoteTimerRef.current) {
        clearInterval(quoteTimerRef.current);
      }
    };
  }, [isLoading, isExiting, currentQuoteIndex]);

  // If not loading and not exiting, do not render into DOM
  if (!isLoading && !isExiting) {
    return null;
  }

  const activeQuote = PRELOADER_QUOTES[currentQuoteIndex] || PRELOADER_QUOTES[0];

  return (
    <div
      className={`ri-preloader-overlay ${isExiting ? 'is-exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
      aria-hidden={!isLoading && !isExiting}
    >
      {/* Screen Reader Notification */}
      <span className="ri-preloader-sr-only">
        {message}
      </span>

      <div className="ri-preloader-content">
        {/* NGO Transparent Emblem with Breathing Animation */}
        <div className="ri-preloader-logo-wrap">
          <div className="ri-preloader-logo-glow" aria-hidden="true" />
          <img
            src={riLogo}
            alt="Responsible Individuals Logo"
            className="ri-preloader-logo"
            loading="eager"
            draggable={false}
          />
        </div>

        {/* NGO Brand Identity */}
        <div className="ri-preloader-brand" aria-hidden="true">
          <span className="ri-preloader-brand-title">Responsible</span>
          <span className="ri-preloader-brand-subtitle">Individuals</span>
        </div>

        {/* Short Inspirational Quote */}
        <div className="ri-preloader-quote-box" aria-hidden="true">
          <p
            className={`ri-preloader-quote ${isQuoteTransitioning ? 'quote-transitioning' : ''}`}
          >
            "{activeQuote.text}"
          </p>
        </div>

        {/* Subtle Loading Indicator */}
        <div className="ri-preloader-bar-wrap" aria-hidden="true">
          <div className="ri-preloader-bar-beam" />
        </div>
      </div>
    </div>
  );
}
