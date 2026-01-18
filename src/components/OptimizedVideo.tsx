// src/components/OptimizedVideo.tsx
import React from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';

interface OptimizedVideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  lazy?: boolean;
  webm?: boolean;
  mp4?: boolean;
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
  ...videoProps
}) => {
  const { isVisible, elementRef } = useLazyLoad<HTMLVideoElement>({
    enabled: lazy,
  });

  const resolvedMuted = autoPlay ? true : muted;

  const sources = buildVideoSources(src, { webm, mp4 });

  // Placeholder (lazy)
  if (lazy && !isVisible) {
    return (
      <div
        className={`${className} media-optimizer-video-placeholder`}
        style={{
          background: poster
            ? `url(${poster}) center / cover no-repeat`
            : '#f0f0f0',
          width: videoProps.width || '100%',
          height: videoProps.height || '300px',
          borderRadius: '4px',
        }}
        aria-label="Video loading"
      />
    );
  }

  return (
    <video
      ref={elementRef}
      className={`${className} media-optimizer-video`}
      poster={poster}
      preload="metadata"
      playsInline
      autoPlay={autoPlay}
      muted={resolvedMuted}
      {...videoProps}
    >
      {sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
      Your browser does not support the video tag.
    </video>
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
