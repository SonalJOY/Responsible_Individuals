import React, { useState, useEffect, useRef, useCallback } from 'react';
import GlobalPreloader from '../components/common/GlobalPreloader';
import { PreloaderContext } from './PreloaderContext';

/**
 * PreloaderProvider:
 * Coordinates initial app initialization, route transition loading,
 * and asynchronous task-based preloading with flicker prevention and timeout guards.
 */
export function PreloaderProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading Responsible Individuals platform...');

  const activeTasksRef = useRef(new Set(['__initial_boot__']));
  const exitTimerRef = useRef(null);
  const safetyTimeoutRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Helper to trigger smooth exit transition
  const triggerExit = useCallback(() => {
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    setIsExiting(true);
    exitTimerRef.current = setTimeout(() => {
      setIsLoading(false);
      setIsExiting(false);
    }, 420);
  }, []);

  // Show preloader for a specific task
  const showPreloader = useCallback((taskId = 'default_task', message) => {
    if (message) setLoadingMessage(message);
    activeTasksRef.current.add(taskId);

    // Cancel any running exit
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    setIsExiting(false);

    // Flicker prevention: wait 120ms before visually forcing isLoading to true if currently false
    if (!isLoading) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        if (activeTasksRef.current.size > 0) {
          setIsLoading(true);
        }
      }, 120);
    }

    // Safety timeout per task (7 seconds max)
    setTimeout(() => {
      if (activeTasksRef.current.has(taskId)) {
        activeTasksRef.current.delete(taskId);
        if (activeTasksRef.current.size === 0) {
          triggerExit();
        }
      }
    }, 7000);
  }, [isLoading, triggerExit]);

  // Hide preloader for a specific task
  const hidePreloader = useCallback((taskId = 'default_task') => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    activeTasksRef.current.delete(taskId);

    if (activeTasksRef.current.size === 0) {
      triggerExit();
    }
  }, [triggerExit]);

  // Wrap a Promise with preloader tracking
  const withPreloader = useCallback(async (promise, taskId = `task_${Date.now()}`, message) => {
    showPreloader(taskId, message);
    try {
      const result = await promise;
      return result;
    } finally {
      hidePreloader(taskId);
    }
  }, [showPreloader, hidePreloader]);

  // 1. Initial Application Boot Loading
  useEffect(() => {
    let isMounted = true;
    const startTime = Date.now();
    const MIN_INITIAL_DISPLAY_MS = 650; // Smooth minimal duration so the breathing animation is enjoyed without being tedious

    const finishInitialLoad = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_INITIAL_DISPLAY_MS - elapsed);

      setTimeout(() => {
        if (!isMounted) return;
        activeTasksRef.current.delete('__initial_boot__');
        if (activeTasksRef.current.size === 0) {
          triggerExit();
        }
      }, remaining);
    };

    // Listen for DOM and font readiness
    if (document.readyState === 'complete') {
      if (document.fonts?.ready) {
        document.fonts.ready.then(finishInitialLoad).catch(finishInitialLoad);
      } else {
        finishInitialLoad();
      }
    } else {
      const handleLoad = () => {
        if (document.fonts?.ready) {
          document.fonts.ready.then(finishInitialLoad).catch(finishInitialLoad);
        } else {
          finishInitialLoad();
        }
      };
      window.addEventListener('load', handleLoad, { once: true });
    }

    // Initial load safety timeout: guaranteed dismissal after 3.8s even on slow 3G
    safetyTimeoutRef.current = setTimeout(() => {
      if (isMounted && activeTasksRef.current.has('__initial_boot__')) {
        activeTasksRef.current.delete('__initial_boot__');
        if (activeTasksRef.current.size === 0) {
          triggerExit();
        }
      }
    }, 3800);

    return () => {
      isMounted = false;
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [triggerExit]);

  return (
    <PreloaderContext.Provider
      value={{
        isLoading,
        isExiting,
        showPreloader,
        hidePreloader,
        withPreloader,
      }}
    >
      {/* Global Preloader Overlay */}
      <GlobalPreloader
        isLoading={isLoading}
        isExiting={isExiting}
        message={loadingMessage}
      />
      {children}
    </PreloaderContext.Provider>
  );
}

export default PreloaderProvider;
