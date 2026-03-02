// src/components/OptimizedVideo.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';
import { generateVideoSchema, injectJsonLd } from '../seo/schemaGenerator';
import { injectPreload } from '../seo/preloadInjector';
import { VideoChapter, PriorityType, LicenseType } from '../types';

declare module 'react' {
  interface VideoHTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}

// Types for SEO features
// export type LicenseType = 
//   | 'CC0'
//   | 'CC BY'
//   | 'CC BY-SA'
//   | 'CC BY-NC'
//   | 'CC BY-ND'
//   | 'CC BY-NC-SA'
//   | 'CC BY-NC-ND'
//   | 'Royalty Free'
//   | 'Commercial'
//   | 'Public Domain'
//   | string;

//export type PriorityType = 'hero' | 'critical' | 'lazy' | false;

// export interface VideoChapter {
//   startTime: number; // seconds
//   title: string;
//   thumbnail?: string;
// }

interface SEOProps {
  /** License type for the video (helps with licensing badges) */
  license?: LicenseType;
  
  /** Video author/creator (improves E-E-AT) */
  author?: string;
  
  /** Video description for schema */
  description?: string;
  
  /** Video chapters for "Key Moments" in Google Search */
  chapters?: VideoChapter[];
  
  /** Video duration in seconds */
  duration?: number;
  
  /** Upload date (ISO string, e.g., "2024-01-15") */
  uploadDate?: string;
  
  /** Whether content is family friendly */
  isFamilyFriendly?: boolean;
  
  /** Keywords for better indexing */
  keywords?: string[];
  
  /** Video transcript for accessibility & SEO */
  transcript?: string;
}

interface PriorityProps {
  /** Priority level - important videos get preload */
  priority?: PriorityType;
  
  /** Browser fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface OptimizedVideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement>,
    SEOProps,
    PriorityProps {
  src: string;
  poster?: string;
  lazy?: boolean;
  webm?: boolean;
  mp4?: boolean;
  /** Disable SEO features if needed */
  disableSEO?: boolean;
  /** Show chapter buttons overlay */
  showChapters?: boolean;
}

export const OptimizedVideo: React.FC<OptimizedVideoProps> = ({
  src,
  poster,
  lazy = true,
  webm = true,
  mp4 = true,
  className = '',
  autoPlay,
  muted,
  
  // New SEO props
  license,
  author,
  description,
  chapters,
  duration,
  uploadDate,
  isFamilyFriendly,
  keywords,
  transcript,
  priority = false,
  fetchPriority = 'auto',
  disableSEO = false,
  showChapters = true,
  
  ...videoProps
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const schemaInjected = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  
  // FIXED: Use elementRef from useLazyLoad for the wrapper div
  const { isVisible, elementRef } = useLazyLoad<HTMLDivElement>({
    enabled: lazy && !priority, // Don't lazy load priority videos
  });

  const resolvedMuted = autoPlay ? true : muted;

  // Build video sources with format fallbacks
  const sources = buildVideoSources(src, { webm, mp4 });

  // Inject preload for priority videos
  useEffect(() => {
    if (priority && src && !disableSEO) {
      injectPreload(src, priority, 'video');
    }
  }, [priority, src, disableSEO]);

  // Inject JSON-LD schema for video SEO
  useEffect(() => {
    if (!disableSEO && src && !schemaInjected.current) {
      const hasSEOProps = license || author || description || chapters || 
                         duration || uploadDate || transcript || keywords;
      
      if (hasSEOProps) {
        const schema = generateVideoSchema({
          url: src,
          poster: poster,
          name: videoProps.title || 'Video',
          description: description || videoProps.title || 'Video content',
          duration,
          uploadDate: uploadDate || new Date().toISOString().split('T')[0],
          author,
          license,
          chapters,
          isFamilyFriendly,
          keywords,
          transcript,
          width: videoProps.width ? Number(videoProps.width) : undefined,
          height: videoProps.height ? Number(videoProps.height) : undefined,
        });
        
        injectJsonLd(schema);
        schemaInjected.current = true;
      }
    }
  }, [src, poster, description, chapters, duration, uploadDate, 
      author, license, isFamilyFriendly, keywords, transcript,
      videoProps.width, videoProps.height, videoProps.title, disableSEO]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    setShowPlaceholder(false);
  };

  const shouldLoadVideo = !lazy || isVisible || priority;

  // FIXED: Move placeholderRef declaration BEFORE it's used
  const placeholderRef = useRef<HTMLDivElement>(null);
  
  // Placeholder (lazy)
  if (lazy && !shouldLoadVideo) {
    return (
      <div
        ref={placeholderRef}
        className={`${className} media-optimizer-video-placeholder`}
        style={{
          background: poster
            ? `url(${poster}) center / cover no-repeat`
            : '#f0f0f0',
          width: videoProps.width || '100%',
          height: videoProps.height || '300px',
          borderRadius: '4px',
          position: 'relative',
        }}
        aria-label="Video loading"
      >
        <div className="media-optimizer-placeholder-icon">▶️</div>
      </div>
    );
  }

  return (
    <div
      ref={elementRef}  // FIXED: Use elementRef from useLazyLoad here
      className="media-optimizer-video-wrapper"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: videoProps.width || '100%',
      }}
      itemScope
      itemType="https://schema.org/VideoObject"
    >
      {/* Blur placeholder while loading */}
      {showPlaceholder && poster && (
        <div
          className="media-optimizer-video-blur"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
            transform: 'scale(1.05)',
            zIndex: 1,
            transition: 'opacity 0.3s ease',
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}

      {/* Loading indicator */}
      {showPlaceholder && (
        <div className="media-optimizer-video-loader">
          <div className="spinner" />
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className={`${className} media-optimizer-video ${
          isLoaded ? 'loaded' : 'loading'
        }`}
        poster={poster}
        preload={priority ? 'auto' : 'metadata'}
        playsInline
        autoPlay={autoPlay}
        muted={resolvedMuted}
        onLoadedData={handleLoadedData}
        fetchPriority={fetchPriority}
        itemProp="contentUrl"
        {...videoProps}
      >
        {sources.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
        Your browser does not support the video tag.
      </video>

      {/* Chapter markers for "Key Moments" */}
      {showChapters && chapters && chapters.length > 0 && (
        <div className="media-optimizer-chapters">
          {chapters.map((chapter, index) => (
            <button
              key={index}
              className="chapter-button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = chapter.startTime;
                  videoRef.current.play();
                }
              }}
              title={chapter.title}
            >
              <span className="chapter-time">
                {formatTime(chapter.startTime)}
              </span>
              <span className="chapter-title">{chapter.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hidden SEO meta data */}
      {!disableSEO && (
        <div style={{ display: 'none' }}>
          {license && <meta itemProp="license" content={license} />}
          {author && <meta itemProp="author" content={author} />}
          {description && <meta itemProp="description" content={description} />}
          {duration && <meta itemProp="duration" content={`PT${duration}S`} />}
          {uploadDate && <meta itemProp="uploadDate" content={uploadDate} />}
          {keywords && keywords.length > 0 && (
            <meta itemProp="keywords" content={keywords.join(', ')} />
          )}
          {transcript && <meta itemProp="transcript" content={transcript} />}
          {videoProps.width && (
            <meta itemProp="width" content={String(videoProps.width)} />
          )}
          {videoProps.height && (
            <meta itemProp="height" content={String(videoProps.height)} />
          )}
        </div>
      )}
    </div>
  );
};

/* ---------------- helpers ---------------- */

function buildVideoSources(
  src: string,
  options: { webm: boolean; mp4: boolean }
) {
  const sources: { src: string; type: string }[] = [];
  const cleanSrc = src.split('?')[0].toLowerCase();

  const isMp4 = cleanSrc.endsWith('.mp4');
  const isWebm = cleanSrc.endsWith('.webm');

  if (isMp4) {
    if (options.webm) {
      sources.push({
        src: src.replace(/\.mp4(\?.*)?$/, '.webm$1'),
        type: 'video/webm',
      });
    }

    if (options.mp4) {
      sources.push({
        src,
        type: 'video/mp4',
      });
    }
  } else if (isWebm) {
    sources.push({
      src,
      type: 'video/webm',
    });
  } else {
    // Unknown format fallback
    sources.push({
      src,
      type: 'video/mp4',
    });
  }

  return sources;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/* ---------------- Styles ---------------- */
export const OptimizedVideoStyles = `
.media-optimizer-video-wrapper {
  position: relative;
  overflow: hidden;
  background: #f0f0f0;
  border-radius: 4px;
}

.media-optimizer-video {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease;
  position: relative;
  z-index: 2;
}

.media-optimizer-video.loaded {
  opacity: 1;
}

.media-optimizer-video-blur {
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.media-optimizer-video-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  pointer-events: none;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.media-optimizer-video-placeholder {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  transition: transform 0.2s;
}

.media-optimizer-placeholder-icon {
  font-size: 3em;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.media-optimizer-video-placeholder:hover .media-optimizer-placeholder-icon {
  opacity: 1;
}

.media-optimizer-chapters {
  position: absolute;
  bottom: 60px;
  left: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px;
  z-index: 4;
  pointer-events: none;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.5) transparent;
}

.media-optimizer-chapters::-webkit-scrollbar {
  height: 4px;
}

.media-optimizer-chapters::-webkit-scrollbar-track {
  background: transparent;
}

.media-optimizer-chapters::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.5);
  border-radius: 4px;
}

.chapter-button {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85em;
  cursor: pointer;
  pointer-events: auto;
  white-space: nowrap;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  backdrop-filter: blur(4px);
}

.chapter-button:hover {
  background: rgba(102, 126, 234, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.chapter-time {
  background: rgba(255,255,255,0.2);
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 0.8em;
  font-family: monospace;
}

.chapter-title {
  font-weight: 500;
}

@media (max-width: 768px) {
  .chapter-button {
    padding: 6px 12px;
    font-size: 0.8em;
  }
  
  .chapter-time {
    padding: 2px 4px;
  }
}
`;

export default OptimizedVideo;