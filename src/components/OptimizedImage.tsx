// components/OptimizedImage.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useOptimizedImage } from '../hooks/useOptimizedImage';
import { useAIDetection } from '../hooks/useAIDetection';
import { generateImageSchema, injectJsonLd } from '../seo/schemaGenerator';
import { injectPreload, getRepresentativeFlag } from '../seo/preloadInjector';

// AI Imports
import { detectFaces } from '../ai/faceDetection';
import { generateCaption } from '../ai/imageCaptioning';
import { calculateSmartCrop, getCropCSS, CropResult } from '../ai/cropCalculator';
import { modelManager } from '../ai/models';

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

// AI Types for v1.2.0
export type SmartCropMode = 'face' | 'subject' | 'auto' | 'center' | false;
export type PortraitPreset = 'natural' | 'professional' | 'dramatic';

interface SEOProps {
  license?: LicenseType;
  author?: string;
  credit?: string;
  caption?: string;
  isFamilyFriendly?: boolean;
  keywords?: string[];
  contentLocation?: string;
  copyrightHolder?: string;
  datePublished?: string;
}

interface PriorityProps {
  priority?: PriorityType;
  fetchPriority?: 'high' | 'low' | 'auto';
}

// AI Props for v1.2.0
interface AIProps {
  /** Auto-detect and crop to subject/face */
  smartCrop?: SmartCropMode;
  
  /** Auto-generate alt text using AI */
  autoAlt?: boolean;
  
  /** Context for better alt text generation */
  altContext?: string;
  
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

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    SEOProps,
    PriorityProps,
    AIProps {
  src: string;
  lazy?: boolean;
  webp?: boolean;
  quality?: number;
  placeholderSrc?: string;
  placeholder?: 'blur' | 'none';
  blurIntensity?: number;
  fallbackSrc?: string;
  showLoadingIndicator?: boolean;
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
  
  // SEO props
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
  
  // AI props
  smartCrop = false,
  autoAlt = false,
  altContext,
  confidenceThreshold = 0.5,
  enableAI = true,
  onAIStart,
  onAIComplete,
  onAIError,
  showAIStatus = true,
  
  ...imgProps
}) => {
  const schemaInjected = useRef(false);
  const [aiProcessedSrc, setAiProcessedSrc] = useState<string | null>(null);
  const [aiAlt, setAiAlt] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'loading' | 'processing' | 'success' | 'error'>('idle');
  const [aiDetections, setAiDetections] = useState<any[]>([]);
  const [cropResult, setCropResult] = useState<CropResult | null>(null);
  const [faceDetectionResult, setFaceDetectionResult] = useState<any>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const {
    src: optimizedSrc,
    isLoading,
    error,
    elementRef,
  } = useOptimizedImage({
    src: aiProcessedSrc || src,
    lazy,
    webp,
    quality,
    fallbackSrc,
  });

  // Use AI detection hook
  const { 
    isLoading: aiLoading, 
    detections, 
    optimalCrop,
    error: aiError 
  } = useAIDetection(src, {
    smartCrop: smartCrop as any,
    confidenceThreshold,
    enableAI: enableAI && (smartCrop !== false)
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper function to generate cropped image URL
  const generateCroppedImageUrl = useCallback((originalSrc: string, crop: CropResult): string => {
    try {
      const url = new URL(originalSrc, window.location.origin);
      url.searchParams.append('crop', `${Math.round(crop.x)},${Math.round(crop.y)},${Math.round(crop.width)},${Math.round(crop.height)}`);
      return url.toString();
    } catch {
      return originalSrc;
    }
  }, []);

  // Use setAiProcessedSrc when crop is available
  useEffect(() => {
    if (cropResult && cropResult.strategyUsed !== 'center' && enableAI) {
      const croppedUrl = generateCroppedImageUrl(src, cropResult);
      setAiProcessedSrc(croppedUrl);
    }
  }, [cropResult, src, enableAI, generateCroppedImageUrl]);

  // Log AI processed source changes
  useEffect(() => {
    if (aiProcessedSrc) {
      console.debug('AI processed image:', aiProcessedSrc);
    }
  }, [aiProcessedSrc]);

  // Update AI status based on loading state
  useEffect(() => {
    if (aiLoading) {
      setAiStatus('loading');
    }
  }, [aiLoading]);

  // Handle optimal crop and errors
  useEffect(() => {
    if (optimalCrop && smartCrop) {
      console.debug('Optimal crop found:', optimalCrop);
    }
    if (aiError) {
      console.error('AI detection error:', aiError);
      onAIError?.(aiError);
    }
  }, [optimalCrop, aiError, smartCrop, onAIError]);

  const resolvedAlt = alt || aiAlt || src.split('/').pop()?.replace(/[-_]/g, ' ') || 'image';
  const showBlur = placeholder === 'blur';

  // Preload AI models
  useEffect(() => {
    if (enableAI) {
      const preloadAIModels = async () => {
        try {
          setAiStatus('loading');
          
          if (smartCrop) {
            await modelManager.loadModel('face-short');
          }
          
          if (autoAlt) {
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
  }, [enableAI, smartCrop, autoAlt]);

  // Direct face detection
  const performFaceDetection = useCallback(async () => {
    if (!enableAI || !smartCrop || !imageRef.current) return;
    
    try {
      const result = await detectFaces(imageRef.current);
      setFaceDetectionResult(result);
      
      if (result.detections.length > 0) {
        console.log(`✅ detectFaces found ${result.detections.length} faces`);
        setAiDetections(result.detections);
      }
    } catch (error) {
      console.error('Face detection failed:', error);
    }
  }, [enableAI, smartCrop]);

  // Run face detection on image load
  useEffect(() => {
    if (isLoaded && !isLoading) {
      performFaceDetection();
    }
  }, [isLoaded, isLoading, performFaceDetection]);

  // Process AI features
  useEffect(() => {
    if (!enableAI) return;

    const processAI = async () => {
      try {
        setAiStatus('processing');
        onAIStart?.();

        const results: any = {
          faceDetection: faceDetectionResult
        };

        // Smart Crop
        if (smartCrop && detections.length > 0 && imgProps.width && imgProps.height) {
          const img = new Image();
          img.src = src;
          await new Promise((resolve) => { img.onload = resolve; });

          const crop = calculateSmartCrop(
            img.naturalWidth,
            img.naturalHeight,
            detections,
            smartCrop === 'center' ? 'auto' : smartCrop,
            {
              targetWidth: Number(imgProps.width),
              targetHeight: Number(imgProps.height),
              padding: 0.1,
              minConfidence: confidenceThreshold
            }
          );
          
          setCropResult(crop);
          results.crop = crop;
        }

        // Auto Alt Text
        if (autoAlt && !alt) {
          const captionResult = await generateCaption(src, {
            context: altContext,
            minConfidence: confidenceThreshold
          });
          
          if (captionResult.text && captionResult.confidence >= (confidenceThreshold || 0.3)) {
            setAiAlt(captionResult.text);
            results.alt = captionResult;
          }
        }

        setAiDetections(detections);
        onAIComplete?.(results);
        setAiStatus('success');

      } catch (error) {
        setAiStatus('error');
        onAIError?.(error as Error);
        console.error('AI processing failed:', error);
      }
    };

    if ((smartCrop && detections.length > 0) || (autoAlt && !alt)) {
      processAI();
    }
  }, [src, smartCrop, autoAlt, detections, alt, altContext, confidenceThreshold, 
      enableAI, onAIStart, onAIComplete, onAIError, imgProps, faceDetectionResult]);

  // Preload hero images
  useEffect(() => {
    if (priority && optimizedSrc && !disableSEO) {
      injectPreload(optimizedSrc, priority);
    }
  }, [priority, optimizedSrc, disableSEO]);

  // Inject SEO schema
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

  // Calculate crop CSS
  const cropStyle = useCallback(() => {
    if (!cropResult || !imageRef.current) return {};
    const img = imageRef.current;
    return getCropCSS(cropResult, img.naturalWidth, img.naturalHeight);
  }, [cropResult]);

  // Combine refs
  const setRefs = useCallback((el: HTMLImageElement | null) => {
    if (elementRef && 'current' in elementRef) {
      (elementRef as React.MutableRefObject<HTMLImageElement | null>).current = el;
    }
    imageRef.current = el;
  }, [elementRef]);

  // Error fallback
  if (error && fallbackSrc) {
    return (
      <img
        ref={setRefs}
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

  return (
    <div
      className="media-optimizer-wrapper"
      style={{ position: 'relative', overflow: 'hidden' }}
      itemScope
      itemType="https://schema.org/ImageObject"
    >
      {/* AI Status Indicator */}
      {showAIStatus && enableAI && aiStatus !== 'idle' && aiStatus !== 'success' && (
        <div className={`media-optimizer-ai-status ${aiStatus}`}>
          {aiStatus === 'loading' && '🔄 Loading AI...'}
          {aiStatus === 'processing' && '🤖 AI Processing...'}
          {aiStatus === 'error' && '⚠️ AI Error'}
        </div>
      )}

      {/* Face Detection Count Badge */}
      {faceDetectionResult?.detections?.length > 0 && (
        <div className="face-detection-badge">
          👤 {faceDetectionResult.detections.length} face(s) detected
        </div>
      )}

      {/* Detection Visualization (dev mode) */}
      {process.env.NODE_ENV === 'development' && aiDetections.length > 0 && (
        <div className="media-optimizer-detections">
          {aiDetections.map((detection, index) => (
            <div
              key={index}
              className="detection-box"
              style={{
                position: 'absolute',
                left: `${detection.boundingBox.x * 100}%`,
                top: `${detection.boundingBox.y * 100}%`,
                width: `${detection.boundingBox.width * 100}%`,
                height: `${detection.boundingBox.height * 100}%`,
                border: '2px solid #00ff00',
                pointerEvents: 'none',
                zIndex: 10
              }}
            />
          ))}
        </div>
      )}

      {/* Blur Layer */}
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

      {/* Legacy Placeholder */}
      {isLoading && placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="media-optimizer-placeholder-layer"
        />
      )}

      {/* Loading Indicator */}
      {showLoadingIndicator && (isLoading || aiStatus === 'processing') && !placeholderSrc && (
        <div className="media-optimizer-loader">
          <div className="spinner" />
          {aiStatus === 'processing' && <span className="loader-text">AI</span>}
        </div>
      )}

      {/* Final Optimized Image */}
      <img
        ref={setRefs}
        src={optimizedSrc}
        alt={resolvedAlt}
        className={`media-optimizer-final-layer ${
          isLoading ? 'loading' : 'loaded'
        } ${className}`}
        loading={lazy ? 'lazy' : 'eager'}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={(e) => {
          setIsLoaded(true);
          if (cropResult) {
            const img = e.currentTarget;
            const style = cropStyle();
            
            if (style.objectPosition) {
              img.style.objectPosition = style.objectPosition as string;
            }
            if (style.objectFit) {
              img.style.objectFit = style.objectFit as string;
            }
          }
          onLoad?.(e);
        }}
        onError={onError}
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
          {aiAlt && !caption && <meta itemProp="caption" content={aiAlt} />}
          {keywords && keywords.length > 0 && (
            <meta itemProp="keywords" content={keywords.join(', ')} />
          )}
          {contentLocation && <meta itemProp="contentLocation" content={contentLocation} />}
          {copyrightHolder && <meta itemProp="copyrightHolder" content={copyrightHolder} />}
          {datePublished && <meta itemProp="datePublished" content={datePublished} />}
          {imgProps.width && <meta itemProp="width" content={String(imgProps.width)} />}
          {imgProps.height && <meta itemProp="height" content={String(imgProps.height)} />}
          {cropResult && <meta itemProp="cropStrategy" content={cropResult.strategyUsed} />}
        </div>
      )}
    </div>
  );
};

/* ---------------- Styles ---------------- */
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
  transition: opacity 300ms ease, object-position 300ms ease;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #667eea;
  animation: spin 1s ease-in-out infinite;
}

.loader-text {
  color: #667eea;
  font-size: 12px;
  font-weight: bold;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* Face Detection Badge */
.face-detection-badge {
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

/* Detection Boxes (dev mode) */
.media-optimizer-detections {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}

/* Error State */
.media-optimizer-error {
  filter: grayscale(100%);
  opacity: 0.7;
}
`;

export default OptimizedImage;