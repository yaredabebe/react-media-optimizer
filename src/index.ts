// ============================================
// Hooks
// ============================================
export { useOptimizedImage } from './hooks/useOptimizedImage';
export { useLazyLoad } from './hooks/useLazyLoad';
export { useAIDetection } from './hooks/useAIDetection';

// ============================================
// Components
// ============================================
export { OptimizedImage } from './components/OptimizedImage';
export { OptimizedVideo } from './components/OptimizedVideo';

// ============================================
// Utils
// ============================================
export {
  compressImage,
  calculateSizeReduction,
} from './utils/compress';

// WebP utilities
import { supportsWebP as webpSupport, convertToWebP as webpConverter } from './utils/webpConverter';
export const supportsWebP = webpSupport;
export const convertToWebP = webpConverter;

// ============================================
// AI Modules (v1.2.0)
// ============================================

// Face Detection
import { 
  initializeFaceDetection,
  detectFaces,
  detectFacesContinuous,
  isFaceDetectionSupported as isFaceSupported,
  getFaceDetectionStats,
  resetFaceDetection as resetFace
} from './ai/faceDetection';

export const isFaceDetectionSupported = isFaceSupported;
export const resetFaceDetection = resetFace;
export {
  initializeFaceDetection,
  detectFaces,
  detectFacesContinuous,
  getFaceDetectionStats
};

// Image Captioning
import {
  initializeCaptioning,
  generateCaption,
  generateWithContext,
  generateVariations,
  isCaptioningSupported as isCaptionSupported,
  getCaptioningStats,
  resetCaptioning as resetCaption
} from './ai/imageCaptioning';

export const isCaptioningSupported = isCaptionSupported;
export const resetCaptioning = resetCaption;
export {
  initializeCaptioning,
  generateCaption,
  generateWithContext,
  generateVariations,
  getCaptioningStats
};

// Crop Calculator
export {
  calculateSmartCrop,
  calculateCenterCrop,
  getCropCSS,
  getCroppedUrl,
  isValidCrop,
  getCropRecommendations
} from './ai/cropCalculator';

// Model Management
import { modelManager as manager, MODEL_URLS, MODEL_METADATA } from './ai/models';
export const modelManager = manager;
export { MODEL_URLS, MODEL_METADATA };

// ============================================
// Type Exports (v1.1.1 & v1.2.0)
// ============================================

// v1.1.1 SEO Types
export type { 
  OptimizedImageProps,
  SEOProps,
  PriorityProps,
  LicenseType,
  PriorityType,
  OptimizedVideoProps,
  VideoSEOProps,
  VideoChapter
} from './types';

// v1.2.0 AI Types
export type {
  AIProps,
  AIConfig,
  AIModelType,
  AIProcessingStatus,
  AIProcessingResult,
  AIModelInfo,
  SmartCropMode,
  PortraitPreset,
  CropCoordinates,
  FaceDetection,
  AIDetection,
  Dimensions,
  ProcessingOptions,
  CompressionResult,
  ImageLoadEvent,
  VideoLoadEvent,
  GlobalConfig
} from './types';

// ============================================
// Schema Generators (SEO)
// ============================================
export { 
  generateImageSchema,
  generateVideoSchema,
  injectJsonLd,
  injectBatchJsonLd,
  clearAllSchemas,
  getLicenseUrl 
} from './seo/schemaGenerator';

// ============================================
// Preload Utilities (Performance)
// ============================================
export { 
  injectPreload,
  preloadCritical,
  preloadResources,
  getRepresentativeFlag 
} from './seo/preloadInjector';

// ============================================
// Version Information
// ============================================
export const VERSION = '1.2.0-beta.1';
export const AI_VERSION = '1.0.0';

/**
 * Check if AI features are supported in current browser
 */
export function isAISupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(window as any).MediaStreamTrack && 
         typeof WebAssembly === 'object' &&
         !!WebAssembly.validate;
}

/**
 * Check if WebP is supported
 */
/**
 * Check if WebP is supported
 */
export async function isWebPSupported(): Promise<boolean> {
  return await webpSupport();
}

/**
 * Check if Intersection Observer is supported
 */
export function isIntersectionObserverSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'IntersectionObserver' in window;
}

/**
 * Get package information
 */
export function getPackageInfo() {
  return {
    name: 'react-media-optimizer',
    version: VERSION,
    aiVersion: AI_VERSION,
    features: {
      seo: true,
      videoChapters: true,
      faceDetection: true,
      autoAlt: true,
      smartCrop: true,
      smartPoster: true,
      autoChapters: true,
      preload: true,
      compression: true
    },
    browserSupport: {
      ai: isAISupported(),
      webp: isWebPSupported(),
      intersectionObserver: isIntersectionObserverSupported()
    }
  };
}

/**
 * Initialize all AI models (optional)
 */
export async function initializeAI(): Promise<boolean> {
  try {
    await Promise.all([
      initializeFaceDetection(),
      initializeCaptioning()
    ]);
    return true;
  } catch (error) {
    console.error('Failed to initialize AI:', error);
    return false;
  }
}

/**
 * Check if specific AI model is ready
 */
export async function isAIModelReady(modelType: 'face' | 'caption'): Promise<boolean> {
  try {
    if (modelType === 'face') {
      await initializeFaceDetection();
      return true;
    } else {
      await initializeCaptioning();
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Get AI model status - FIXED with proper imports
 */
export function getAIStatus() {
  return {
    faceDetection: {
      supported: isFaceDetectionSupported(),
      initialized: !!modelManager['loadedModels']?.get('face-short')
    },
    imageCaptioning: {
      supported: isCaptioningSupported(),
      initialized: !!modelManager['loadedModels']?.get('caption-encoder')
    }
  };
}

/**
 * Reset all AI models (cleanup) - FIXED with proper imports
 */
export function resetAllAI(): void {
  resetFaceDetection();
  resetCaptioning();
  modelManager.clearAllModels();
}