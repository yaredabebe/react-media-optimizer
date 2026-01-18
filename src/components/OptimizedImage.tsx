import React from 'react';
import { useOptimizedImage } from '../hooks/useOptimizedImage';

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  lazy?: boolean;
  webp?: boolean;
  quality?: number;
  placeholderSrc?: string;
  fallbackSrc?: string;
  showLoadingIndicator?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  lazy = true,
  webp = true,
  quality = 80,
  placeholderSrc,
  fallbackSrc,
  showLoadingIndicator = true,
  className = '',
  alt,
  onLoad,   
  onError,
  ...imgProps
}) => {
  const {
    src: optimizedSrc,
    isLoading,
    error,
    elementRef,
  } = useOptimizedImage({
    src,
    lazy,
    webp,
    quality,
    fallbackSrc,
    // 👇 internal lifecycle hooks (NOT React events)
    onOptimizedLoad: () => {
      // optional: internal tracking / analytics
    },
    onOptimizedError: () => {
      // optional: internal error handling
    },
  });

  const resolvedAlt =
    alt ||
    src.split('/').pop()?.replace(/[-_]/g, ' ') ||
    'image';

  /* ---------------- Loading / Placeholder ---------------- */

  if (isLoading && showLoadingIndicator && placeholderSrc) {
    return (
      <img
        ref={elementRef}
        src={placeholderSrc}
        alt={`Loading ${resolvedAlt}`}
        className={`${className} media-optimizer-loading`}
        aria-busy="true"
        {...imgProps}
      />
    );
  }

  /* ---------------- Error fallback ---------------- */

  if (error && fallbackSrc) {
    return (
      <img
        ref={elementRef}
        src={fallbackSrc}
        alt={`Fallback for ${resolvedAlt}`}
        className={`${className} media-optimizer-error`}
        onLoad={onLoad}
        onError={onError}
        {...imgProps}
      />
    );
  }

  /* ---------------- Optimized image ---------------- */

  return (
    <img
      ref={elementRef}
      src={optimizedSrc}
      alt={resolvedAlt}
      className={`${className} media-optimizer-loaded`}
      loading={lazy ? undefined : 'eager'}
      decoding="async"
      onLoad={onLoad}     // React DOM event
      onError={onError}   // React DOM event
      {...imgProps}
    />
  );
};

/* ---------------- Optional default styles ---------------- */

export const OptimizedImageStyles = `
.media-optimizer-loading {
  opacity: 0.6;
}

.media-optimizer-loaded {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0.6; }
  to { opacity: 1; }
}
`;
