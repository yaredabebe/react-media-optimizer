//hooks/useOtimization.ts
import { useState, useEffect, useRef } from 'react';
import { useLazyLoad } from './useLazyLoad';
import { supportsWebP, convertToWebP } from '../utils/webpConverter';

/**
 * Internal hook options
 * NOTE:
 * - This hook does NOT accept React event handlers
 * - It exposes simple lifecycle callbacks instead
 */
interface UseOptimizedImageOptions {
  src: string;
  lazy?: boolean;
  webp?: boolean;
  quality?: number;
  fallbackSrc?: string;
  onOptimizedLoad?: () => void;
  onOptimizedError?: () => void;
}

let cachedWebPSupport: boolean | null = null;

export function useOptimizedImage(options: UseOptimizedImageOptions) {
  const {
    src,
    lazy = true,
    webp = true,
    quality = 80,
    fallbackSrc,
    onOptimizedLoad,
    onOptimizedError,
  } = options;

  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const { isVisible, elementRef } =
    useLazyLoad<HTMLImageElement>({ enabled: lazy });

  const isCancelled = useRef(false);

  useEffect(() => {
    if (lazy && !isVisible) return;

    isCancelled.current = false;

    const optimizeImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Cache WebP support (run once per app)
        if (cachedWebPSupport === null) {
          cachedWebPSupport = await supportsWebP();
        }

        let finalSrc = src;

        // Convert to WebP if supported and remote
        if (webp && cachedWebPSupport && isRemoteUrl(src)) {
          finalSrc = convertToWebP(src);
        }

        // Append quality only for remote URLs
        if (isRemoteUrl(finalSrc) && typeof quality === 'number') {
          const separator = finalSrc.includes('?') ? '&' : '?';
          finalSrc += `${separator}q=${quality}`;
        }

        // Preload image
        await preloadImage(finalSrc);

        if (!isCancelled.current) {
          setOptimizedSrc(finalSrc);
          setIsLoading(false);
          onOptimizedLoad?.();
        }
      } catch (err) {
        if (!isCancelled.current) {
          if (fallbackSrc) {
            setOptimizedSrc(fallbackSrc);
            setIsLoading(false);
          } else {
            setError(err as Error);
            setIsLoading(false);
            onOptimizedError?.();
          }
        }
      }
    };

    optimizeImage();

    return () => {
      isCancelled.current = true;
    };
  }, [src, isVisible, lazy, webp, quality, fallbackSrc]);

  return {
    src: optimizedSrc,
    isLoading,
    error,
    elementRef,
    isVisible,
  };
}

/* ---------------- helpers ---------------- */

function isRemoteUrl(url: string) {
  return /^https?:\/\//.test(url);
}

function preloadImage(src: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}
