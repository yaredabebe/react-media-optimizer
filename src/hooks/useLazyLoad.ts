// src/hooks/useLazyLoad.ts
import { useState, useEffect, useRef, RefObject } from 'react';

interface UseLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * useLazyLoad
 * - Observes element visibility using IntersectionObserver
 * - Safe for SSR
 * - Stable ref ownership
 */
export function useLazyLoad<T extends HTMLElement = HTMLElement>(
  options: UseLazyLoadOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    enabled = true,
  } = options;

  const [isVisible, setIsVisible] = useState(!enabled);
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsVisible(true);
      return;
    }

    // SSR / legacy browser safety
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const node = elementRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [enabled, threshold, rootMargin]);

  return {
    isVisible,
    elementRef: elementRef as RefObject<T>,
  };
}
