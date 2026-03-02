// components/OptimizedImage.tsx
import React, { useEffect, useRef } from 'react';
import { useOptimizedImage } from '../hooks/useOptimizedImage';
import { generateImageSchema, injectJsonLd } from '../seo/schemaGenerator';
import { injectPreload, getRepresentativeFlag } from '../seo/preloadInjector';

// Types for SEO features
export type LicenseType = 
  | 'CC0'
  | 'CC BY'
  | 'CC BY-SA'
  | 'CC BY-NC'
  | 'CC BY-ND'
  | 'CC BY-NC-SA'
  | 'CC BY-NC-ND'
  | 'Royalty Free'
  | 'Commercial'
  | 'Public Domain'
  | string;

export type PriorityType = 'hero' | 'critical' | 'lazy' | false;

interface SEOProps {
  /** License type for the image (gets "Licensable" badge in Google) */
  license?: LicenseType;
  
  /** Author/creator name (improves E-E-AT) */
  author?: string;
  
  /** Photographer credit */
  credit?: string;
  
  /** Image caption for schema */
  caption?: string;
  
  /** Whether content is family friendly */
  isFamilyFriendly?: boolean;
  
  /** Keywords for better indexing */
  keywords?: string[];
  
  /** Location where photo was taken */
  contentLocation?: string;
  
  /** Copyright holder */
  copyrightHolder?: string;
  
  /** Publication date (ISO string) */
  datePublished?: string;
}

interface PriorityProps {
  /** Priority level - hero images get preload + representativeOfPage */
  priority?: PriorityType;
  
  /** Browser fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    SEOProps,
    PriorityProps {
  src: string;
  lazy?: boolean;
  webp?: boolean;
  quality?: number;
  placeholderSrc?: string; // legacy support
  placeholder?: 'blur' | 'none';
  blurIntensity?: number;
  fallbackSrc?: string;
  showLoadingIndicator?: boolean;
  /** Disable SEO features if needed */
  disableSEO?: boolean;
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
  
  // New SEO props
  license,
  author,
  credit,
  caption,
  isFamilyFriendly,
  keywords,
  contentLocation,
  copyrightHolder,
  datePublished,
  priority = false,
  fetchPriority = 'auto',
  disableSEO = false,
  
  ...imgProps
}) => {
  const schemaInjected = useRef(false);
  
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

  // Inject preload for hero/critical images
  useEffect(() => {
    if (priority && optimizedSrc && !disableSEO) {
      injectPreload(optimizedSrc, priority);
    }
  }, [priority, optimizedSrc, disableSEO]);

  // Inject JSON-LD schema for SEO
  useEffect(() => {
    if (!disableSEO && optimizedSrc && !schemaInjected.current) {
      const hasSEOProps = license || author || credit || caption || 
                         keywords || contentLocation || copyrightHolder || 
                         datePublished || priority;
      
      if (hasSEOProps) {
        const schema = generateImageSchema({
          url: optimizedSrc,
          alt: resolvedAlt,
          width: imgProps.width ? Number(imgProps.width) : undefined,
          height: imgProps.height ? Number(imgProps.height) : undefined,
          license,
          author,
          credit,
          caption: caption || resolvedAlt,
          isFamilyFriendly,
          keywords,
          contentLocation,
          copyrightHolder,
          datePublished,
          isRepresentative: getRepresentativeFlag(priority),
        });
        
        injectJsonLd(schema);
        schemaInjected.current = true;
      }
    }
  }, [optimizedSrc, resolvedAlt, disableSEO, license, author, credit, caption, 
      isFamilyFriendly, keywords, contentLocation, copyrightHolder, datePublished, 
      priority, imgProps.width, imgProps.height]);

  /* ---------------- Error fallback ---------------- */
  if (error && fallbackSrc) {
    return (
      <img
        ref={elementRef}
        src={fallbackSrc}
        alt={`Fallback for ${resolvedAlt}`}
        className={`${className} media-optimizer-error`}
        loading={lazy ? 'lazy' : 'eager'}
        fetchPriority={fetchPriority}
        onLoad={onLoad}
        onError={onError}
        {...imgProps}
      />
    );
  }

  /* ---------------- Layered Rendering with SEO Attributes ---------------- */
  return (
    <div
      className="media-optimizer-wrapper"
      style={{ position: 'relative', overflow: 'hidden' }}
      // Add SEO attributes for better indexing
      itemScope
      itemType="https://schema.org/ImageObject"
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

      {/* Loading Indicator */}
      {showLoadingIndicator && isLoading && !placeholderSrc && (
        <div className="media-optimizer-loader">
          <div className="spinner" />
        </div>
      )}

      {/* Final Optimized Image with SEO meta tags */}
      <img
        ref={elementRef}
        src={optimizedSrc}
        alt={resolvedAlt}
        className={`media-optimizer-final-layer ${
          isLoading ? 'loading' : 'loaded'
        } ${className}`}
        loading={lazy ? 'lazy' : 'eager'}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={onLoad}
        onError={onError}
        // SEO attributes
        itemProp="contentUrl"
        {...imgProps}
      />

      {/* Hidden SEO meta data */}
      {!disableSEO && (
        <div style={{ display: 'none' }}>
          {license && <meta itemProp="license" content={license} />}
          {author && <meta itemProp="author" content={author} />}
          {credit && <meta itemProp="creditText" content={credit} />}
          {caption && <meta itemProp="caption" content={caption} />}
          {keywords && keywords.length > 0 && (
            <meta itemProp="keywords" content={keywords.join(', ')} />
          )}
          {contentLocation && (
            <meta itemProp="contentLocation" content={contentLocation} />
          )}
          {copyrightHolder && (
            <meta itemProp="copyrightHolder" content={copyrightHolder} />
          )}
          {datePublished && (
            <meta itemProp="datePublished" content={datePublished} />
          )}
          {imgProps.width && (
            <meta itemProp="width" content={String(imgProps.width)} />
          )}
          {imgProps.height && (
            <meta itemProp="height" content={String(imgProps.height)} />
          )}
        </div>
      )}
    </div>
  );
};

/* ---------------- Enhanced Styles ---------------- */
export const OptimizedImageStyles = `
.media-optimizer-wrapper {
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.media-optimizer-wrapper img {
  width: 100%;
  height: auto;
  display: block;
  transition: opacity 300ms ease;
}

.media-optimizer-blur-layer,
.media-optimizer-placeholder-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  transition: opacity 300ms ease;
  pointer-events: none;
}

.media-optimizer-final-layer {
  position: relative;
  z-index: 2;
  opacity: 0;
}

.media-optimizer-final-layer.loaded {
  opacity: 1;
}

.media-optimizer-final-layer.loaded ~ .media-optimizer-blur-layer,
.media-optimizer-final-layer.loaded ~ .media-optimizer-placeholder-layer {
  opacity: 0;
}

/* Loading Indicator */
.media-optimizer-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.media-optimizer-error {
  filter: grayscale(100%);
  opacity: 0.7;
}
`;

export default OptimizedImage;