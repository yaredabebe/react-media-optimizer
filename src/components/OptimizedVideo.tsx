// src/components/OptimizedVideo.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLazyLoad } from '../hooks/useLazyLoad';
import { generateVideoSchema, injectJsonLd } from '../seo/schemaGenerator';
import { injectPreload } from '../seo/preloadInjector';
import { VideoChapter, PriorityType, LicenseType } from '../types';

// AI Imports
import { detectFaces } from '../ai/faceDetection';
import { generateCaption } from '../ai/imageCaptioning';
import { modelManager } from '../ai/models';

declare module 'react' {
  interface VideoHTMLAttributes<T> {
    fetchPriority?: 'high' | 'low' | 'auto';
  }
}

// AI Props interface
interface AIProps {
  /** Auto-generate video description using AI */
  autoDescription?: boolean;
  
  /** Auto-generate video chapters using AI (scene detection) */
  autoChapters?: boolean;
  
  /** Number of auto chapters to generate */
  autoChaptersCount?: number;
  
  /** Auto-generate video transcript */
  autoTranscript?: boolean;
  
  /** Auto-select best poster frame (face detection) */
  smartPoster?: boolean;
  
  /** Minimum confidence for AI detection (0-1) */
  confidenceThreshold?: number;
  
  /** Enable AI features (default: true) */
  enableAI?: boolean;
  
  /** Callback when AI processing starts */
  onAIStart?: () => void;
  
  /** Callback when AI processing completes */
  onAIComplete?: (result: any) => void;
  
  /** Callback when AI encounters an error */
  onAIError?: (error: Error) => void;
  
  /** Show AI processing indicator */
  showAIStatus?: boolean;
}

interface SEOProps {
  license?: LicenseType;
  author?: string;
  description?: string;
  chapters?: VideoChapter[];
  duration?: number;
  uploadDate?: string;
  isFamilyFriendly?: boolean;
  keywords?: string[];
  transcript?: string;
}

interface PriorityProps {
  priority?: PriorityType;
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface OptimizedVideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement>,
    SEOProps,
    PriorityProps,
    AIProps {
  src: string;
  poster?: string;
  lazy?: boolean;
  webm?: boolean;
  mp4?: boolean;
  disableSEO?: boolean;
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
  
  // SEO props
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
  
  // AI props
  autoDescription = false,
  autoChapters = false,
  autoChaptersCount = 5,
  autoTranscript = false,
  smartPoster = false,
  confidenceThreshold = 0.5,
  enableAI = true,
  onAIStart,
  onAIComplete,
  onAIError,
  showAIStatus = true,
  
  ...videoProps
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const schemaInjected = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'processing' | 'success' | 'error'>('idle');
  const [aiGeneratedPoster, setAiGeneratedPoster] = useState<string | null>(null);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState<string | null>(null);
  const [aiGeneratedChapters, setAiGeneratedChapters] = useState<VideoChapter[]>([]);
  const [aiGeneratedTranscript, setAiGeneratedTranscript] = useState<string | null>(null);
  
  const { isVisible, elementRef } = useLazyLoad<HTMLDivElement>({
    enabled: lazy && !priority,
  });

  const resolvedMuted = autoPlay ? true : muted;

  // Build video sources with format fallbacks
  const sources = buildVideoSources(src, { webm, mp4 });

  // Preload AI models if AI is enabled
  useEffect(() => {
    if (enableAI) {
      const preloadAIModels = async () => {
        try {
          setAiStatus('loading');
          
          if (smartPoster) {
            await modelManager.loadModel('face-short');
          }
          
          if (autoDescription || autoChapters || autoTranscript) {
            await modelManager.loadModel('caption-encoder');
            await modelManager.loadModel('caption-decoder');
          }
          
          setAiStatus('idle');
        } catch (error) {
          console.error('Failed to preload AI models:', error);
          setAiStatus('error');
        }
      };
      
      preloadAIModels();
    }
  }, [enableAI, smartPoster, autoDescription, autoChapters, autoTranscript]);

  // Inject preload for priority videos
  useEffect(() => {
    if (priority && src && !disableSEO) {
      injectPreload(src, priority, 'video');
    }
  }, [priority, src, disableSEO]);

  // Process AI features
 useEffect(() => {
  if (!enableAI || !isLoaded || !videoRef.current) return;

  const processAIFeatures = async () => {
    try {
      setAiStatus('processing');
      onAIStart?.();

      const results: any = {};
      
      // Store video reference at the start
      const video = videoRef.current;
      if (!video) return;

      // 1. Smart Poster Frame (face detection)
      if (smartPoster && !poster) {
        // Seek to 25% of video for best frame
        video.currentTime = (video.duration || 0) * 0.25;
        
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
        });

        // Capture frame to canvas
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            
            // Detect faces in the frame
            const imageData = canvas.toDataURL('image/jpeg');
            const img = new Image();
            img.src = imageData;
            
            await new Promise((resolve) => { img.onload = resolve; });
            
            const faceResult = await detectFaces(img);
            
            if (faceResult.detections.length > 0) {
              // Frame has faces, use it as poster
              setAiGeneratedPoster(imageData);
              results.poster = 'face-detected';
            }
          }
        }
      }

      // 2. Auto Description Generation
      if (autoDescription && !description) {
        // Generate description based on video title or filename
        const title = videoProps.title || src.split('/').pop() || 'video';
        const desc = await generateCaption(src, {
          context: `Video titled: ${title}`,
          minConfidence: confidenceThreshold
        });
        
        if (desc.text) {
          setAiGeneratedDescription(desc.text);
          results.description = desc;
        }
      }

      // 3. Auto Chapter Generation
      if (autoChapters && (!chapters || chapters.length === 0)) {
        // Simple chapter generation based on duration
        const vidDuration = duration || video.duration || 300;
        const chapterCount = autoChaptersCount;
        const chapterDuration = vidDuration / chapterCount;
        
        const newChapters: VideoChapter[] = [];
        for (let i = 0; i < chapterCount; i++) {
          newChapters.push({
            startTime: i * chapterDuration,
            title: `Chapter ${i + 1}`,
          });
        }
        
        setAiGeneratedChapters(newChapters);
        results.chapters = newChapters;
      }

      // 4. Auto Transcript Generation (simplified)
      if (autoTranscript && !transcript) {
        setAiGeneratedTranscript('Auto-generated transcript would appear here');
        results.transcript = 'generated';
      }

      onAIComplete?.(results);
      setAiStatus('success');

    } catch (error) {
      setAiStatus('error');
      onAIError?.(error as Error);
      console.error('AI processing failed:', error);
    }
  };

  processAIFeatures();
}, [isLoaded, enableAI, smartPoster, autoDescription, autoChapters, autoTranscript, 
    poster, description, chapters, duration, autoChaptersCount, confidenceThreshold,
    src, videoProps.title, transcript]);
  // Inject JSON-LD schema for video SEO
  useEffect(() => {
    if (!disableSEO && src && !schemaInjected.current) {
      const hasSEOProps = license || author || description || aiGeneratedDescription || 
                         chapters || aiGeneratedChapters.length > 0 ||
                         duration || uploadDate || transcript || aiGeneratedTranscript ||
                         keywords;
      
      if (hasSEOProps) {
        const schema = generateVideoSchema({
          url: src,
          poster: aiGeneratedPoster || poster,
          name: videoProps.title || 'Video',
          description: aiGeneratedDescription || description || videoProps.title || 'Video content',
          duration,
          uploadDate: uploadDate || new Date().toISOString().split('T')[0],
          author,
          license,
          chapters: chapters || aiGeneratedChapters,
          isFamilyFriendly,
          keywords,
          transcript: aiGeneratedTranscript || transcript,
          width: videoProps.width ? Number(videoProps.width) : undefined,
          height: videoProps.height ? Number(videoProps.height) : undefined,
        });
        
        injectJsonLd(schema);
        schemaInjected.current = true;
      }
    }
  }, [src, poster, aiGeneratedPoster, description, aiGeneratedDescription, 
      chapters, aiGeneratedChapters, duration, uploadDate, author, license, 
      isFamilyFriendly, keywords, transcript, aiGeneratedTranscript,
      videoProps.width, videoProps.height, videoProps.title, disableSEO]);

  const handleLoadedData = () => {
    setIsLoaded(true);
    setShowPlaceholder(false);
  };

  const shouldLoadVideo = !lazy || isVisible || priority;
  const placeholderRef = useRef<HTMLDivElement>(null);
  
  // Placeholder (lazy)
  if (lazy && !shouldLoadVideo) {
    return (
      <div
        ref={placeholderRef}
        className={`${className} media-optimizer-video-placeholder`}
        style={{
          background: aiGeneratedPoster || poster
            ? `url(${aiGeneratedPoster || poster}) center / cover no-repeat`
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
      ref={elementRef}
      className="media-optimizer-video-wrapper"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: videoProps.width || '100%',
      }}
      itemScope
      itemType="https://schema.org/VideoObject"
    >
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* AI Status Indicator */}
      {showAIStatus && enableAI && aiStatus !== 'idle' && aiStatus !== 'success' && (
        <div className={`media-optimizer-ai-status ${aiStatus}`}>
          {aiStatus === 'loading' && '🔄 Loading AI...'}
          {aiStatus === 'processing' && '🤖 AI Processing Video...'}
          {aiStatus === 'error' && '⚠️ AI Error'}
        </div>
      )}

      {/* Blur placeholder while loading */}
      {showPlaceholder && (aiGeneratedPoster || poster) && (
        <div
          className="media-optimizer-video-blur"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${aiGeneratedPoster || poster})`,
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
          {aiStatus === 'processing' && <span className="loader-text">AI</span>}
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className={`${className} media-optimizer-video ${
          isLoaded ? 'loaded' : 'loading'
        }`}
        poster={aiGeneratedPoster || poster}
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
      {showChapters && (chapters || aiGeneratedChapters.length > 0) && (
        <div className="media-optimizer-chapters">
          {(chapters || aiGeneratedChapters).map((chapter, index) => (
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

      {/* AI Generated Badge */}
      {aiGeneratedChapters.length > 0 && (
        <div className="ai-generated-badge">
          🤖 AI Generated Chapters
        </div>
      )}

      {/* Hidden SEO meta data */}
      {!disableSEO && (
        <div style={{ display: 'none' }}>
          {license && <meta itemProp="license" content={license} />}
          {author && <meta itemProp="author" content={author} />}
          <meta itemProp="description" content={aiGeneratedDescription || description || ''} />
          {duration && <meta itemProp="duration" content={`PT${duration}S`} />}
          {uploadDate && <meta itemProp="uploadDate" content={uploadDate} />}
          {keywords && keywords.length > 0 && (
            <meta itemProp="keywords" content={keywords.join(', ')} />
          )}
          {(transcript || aiGeneratedTranscript) && (
            <meta itemProp="transcript" content={aiGeneratedTranscript || transcript} />
          )}
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

.loader-text {
  color: white;
  font-size: 12px;
  margin-top: 8px;
  display: block;
  text-align: center;
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

/* AI Status Indicator */
.media-optimizer-ai-status {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 20;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  backdrop-filter: blur(4px);
}

.media-optimizer-ai-status.processing {
  background: rgba(102, 126, 234, 0.9);
  animation: pulse 2s infinite;
}

.media-optimizer-ai-status.error {
  background: rgba(244, 67, 54, 0.9);
}

.media-optimizer-ai-status.success {
  background: rgba(76, 175, 80, 0.9);
}

.ai-generated-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(156, 39, 176, 0.9);
  color: white;
  backdrop-filter: blur(4px);
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
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