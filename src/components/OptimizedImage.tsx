import React from 'react';
import { useOptimizedImage } from '../hooks/useOptimizedImage';

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  lazy?: boolean;
  webp?: boolean;
  quality?: number;
  placeholderSrc?: string; // legacy support
  placeholder?: 'blur' | 'none';
  blurIntensity?: number;
  fallbackSrc?: string;
  showLoadingIndicator?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  lazy = true,
  webp = true,
  quality = 80,
  placeholderSrc,
  placeholder = 'none',
  blurIntensity = 20,
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
  });

  const resolvedAlt =
    alt ||
    src.split('/').pop()?.replace(/[-_]/g, ' ') ||
    'image';

  const showBlur = placeholder === 'blur';

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

  /* ---------------- Layered Rendering ---------------- */

  return (
    <div
      className="media-optimizer-wrapper"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Blur Layer (Auto Blur) */}
      {showBlur && (
        <img
          src={optimizedSrc}
          alt=""
          aria-hidden="true"
          className="media-optimizer-blur-layer"
          style={{
            filter: `blur(${blurIntensity}px)`,
            transform: 'scale(1.05)',
          }}
        />
      )}

      {/* Legacy Placeholder Support */}
      {isLoading && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="media-optimizer-placeholder-layer"
        />
      )}

      {/* Final Optimized Image */}
      <img
        ref={elementRef}
        src={optimizedSrc}
        alt={resolvedAlt}
        className={`media-optimizer-final-layer ${
          isLoading ? 'loading' : 'loaded'
        } ${className}`}
        loading={lazy ? undefined : 'eager'}
        decoding="async"
        onLoad={onLoad}
        onError={onError}
        {...imgProps}
      />
    </div>
  );
};

/* ---------------- Default Styles ---------------- */

export const OptimizedImageStyles = `
.media-optimizer-wrapper {
  display: inline-block;
}

.media-optimizer-wrapper img {
  width: 100%;
  height: auto;
  display: block;
}

.media-optimizer-blur-layer,
.media-optimizer-placeholder-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  transition: opacity 300ms ease;
}

.media-optimizer-final-layer {
  position: relative;
  z-index: 2;
  opacity: 0;
  transition: opacity 300ms ease;
}

.media-optimizer-final-layer.loaded {
  opacity: 1;
}

.media-optimizer-final-layer.loaded ~ .media-optimizer-blur-layer,
.media-optimizer-final-layer.loaded ~ .media-optimizer-placeholder-layer {
  opacity: 0;
}
`;