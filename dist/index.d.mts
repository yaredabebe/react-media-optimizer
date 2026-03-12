import * as React$1 from 'react';
import React__default, { RefObject } from 'react';

/**
 * CDN URLs for AI models used in react-media-optimizer v1.2.0
 * Models are loaded dynamically only when needed
 */
declare const MODEL_URLS: {
    /** Fast face detection model - smaller size, faster inference */
    FACE_SHORT: string;
    /** Accurate face detection model - better quality, larger size */
    FACE_FULL: string;
    /** Face detection WASM binary */
    FACE_WASM: string;
    /** Face detection SIMD WASM (faster on supported browsers) */
    FACE_SIMD: string;
    /** Vision encoder model - converts image to features */
    CAPTION_ENCODER: string;
    /** Text decoder model - generates captions from features */
    CAPTION_DECODER: string;
    /** Vocabulary file for tokenizing text */
    CAPTION_VOCAB: string;
    /** Tokenizer config */
    CAPTION_TOKENIZER: string;
    /** Model config */
    CAPTION_CONFIG: string;
    /** Merged model (encoder + decoder combined) - for advanced usage */
    CAPTION_MERGED: string;
};
/**
 * Model metadata for better management
 */
declare const MODEL_METADATA: {
    readonly 'face-short': {
        readonly url: string;
        readonly size: 2100000;
        readonly type: "tflite";
        readonly description: "Fast face detection (short range)";
        readonly supported: true;
        readonly version: "0.4.0";
    };
    readonly 'face-full': {
        readonly url: string;
        readonly size: 4200000;
        readonly type: "tflite";
        readonly description: "Accurate face detection (full range)";
        readonly supported: true;
        readonly version: "0.4.0";
    };
    readonly 'caption-encoder': {
        readonly url: string;
        readonly size: 5100000;
        readonly type: "onnx";
        readonly description: "Image captioning encoder";
        readonly supported: true;
        readonly version: "2.5.0";
    };
    readonly 'caption-decoder': {
        readonly url: string;
        readonly size: 3200000;
        readonly type: "onnx";
        readonly description: "Image captioning decoder";
        readonly supported: true;
        readonly version: "2.5.0";
    };
    readonly 'caption-vocab': {
        readonly url: string;
        readonly size: 1100000;
        readonly type: "json";
        readonly description: "Vocabulary for tokenization";
        readonly supported: true;
        readonly version: "2.5.0";
    };
};
/**
 * Model type definitions
 */
type ModelType = 'face-short' | 'face-full' | 'caption-encoder' | 'caption-decoder' | 'caption-vocab';
type ModelFormat = 'tflite' | 'onnx' | 'json' | 'wasm';

interface ModelLoadOptions {
    /** Timeout in milliseconds */
    timeout?: number;
    /** Whether to use SIMD if available */
    preferSIMD?: boolean;
    /** Callback for progress updates */
    onProgress?: (progress: number) => void;
}
interface ModelInfo {
    name: string;
    type: ModelFormat;
    size: number;
    loaded: boolean;
    loading: boolean;
    error?: Error;
    metadata?: typeof MODEL_METADATA[keyof typeof MODEL_METADATA];
}
declare class ModelManager {
    private static instance;
    private loadedModels;
    private modelStatus;
    private modelErrors;
    private modelCache;
    private modelCallbacks;
    private constructor();
    static getInstance(): ModelManager;
    /**
     * Load a model by name
     */
    loadModel(modelName: ModelType, options?: ModelLoadOptions): Promise<any>;
    /**
     * Load model from specific URL
     */
    private loadModelFromUrl;
    /**
     * Parse model based on format
     */
    private parseModel;
    private parseTFLite;
    private parseONNX;
    private parseJSON;
    private parseWASM;
    /**
     * Wait for a model that's currently loading
     */
    private waitForModel;
    /**
     * Check if model is loaded
     */
    isModelLoaded(modelName: ModelType): boolean;
    /**
     * Check if model is loading
     */
    isModelLoading(modelName: ModelType): boolean;
    /**
     * Get model error if any
     */
    getModelError(modelName: ModelType): Error | undefined;
    /**
     * Get all model information
     */
    getModelInfo(): ModelInfo[];
    /**
     * Unload a model to free memory
     */
    unloadModel(modelName: ModelType): void;
    /**
     * Clear all models from memory
     */
    clearAllModels(): void;
    /**
     * Get total memory used by models
     */
    getTotalMemoryUsage(): number;
    /**
     * Get available models
     */
    getAvailableModels(): string[];
    /**
     * Format size in human readable format
     */
    private getSizeReadable;
}

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
declare function useOptimizedImage(options: UseOptimizedImageOptions): {
    src: string;
    isLoading: boolean;
    error: Error | null;
    elementRef: React$1.RefObject<HTMLImageElement>;
    isVisible: boolean;
};

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
declare function useLazyLoad<T extends HTMLElement = HTMLElement>(options?: UseLazyLoadOptions): {
    isVisible: boolean;
    elementRef: RefObject<T>;
};

type LicenseType$1 = 'CC0' | 'CC BY' | 'CC BY-SA' | 'CC BY-NC' | 'CC BY-ND' | 'CC BY-NC-SA' | 'CC BY-NC-ND' | 'Royalty Free' | 'Commercial' | 'Public Domain' | string;
type PriorityType$1 = 'hero' | 'critical' | 'lazy' | false;
interface VideoChapter {
    /** Start time in seconds */
    startTime: number;
    /** Chapter title */
    title: string;
    /** Optional thumbnail for the chapter */
    thumbnail?: string;
}
interface SEOProps$2 {
    /** License type for the image (gets "Licensable" badge in Google) */
    license?: LicenseType$1;
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
interface PriorityProps$2 {
    /** Priority level - hero images get preload + representativeOfPage */
    priority?: PriorityType$1;
    /** Browser fetch priority hint */
    fetchPriority?: 'high' | 'low' | 'auto';
}
interface OptimizedImageProps$1 extends SEOProps$2, PriorityProps$2 {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    webp?: boolean;
    lazy?: boolean;
    placeholder?: 'blur' | 'none';
    blurIntensity?: number;
    className?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
    onError?: () => void;
}
interface VideoSEOProps {
    /** Video title */
    title?: string;
    /** Video description */
    description?: string;
    /** Video chapters for Key Moments */
    chapters?: VideoChapter[];
    /** Video duration in seconds */
    duration?: number;
    /** Upload date (ISO string) */
    uploadDate?: string;
    /** Video transcript */
    transcript?: string;
}
interface OptimizedVideoProps$1 extends VideoSEOProps, PriorityProps$2 {
    src: string;
    poster?: string;
    lazy?: boolean;
    webm?: boolean;
    mp4?: boolean;
    disableSEO?: boolean;
    showChapters?: boolean;
    className?: string;
    style?: React.CSSProperties;
    controls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    onLoad?: () => void;
    onError?: () => void;
}
type SmartCropMode$1 = 'face' | 'subject' | 'auto' | 'center' | false;
type PortraitPreset = 'natural' | 'professional' | 'dramatic';
type AIModelType = 'face-detection' | 'image-captioning' | 'portrait-enhancement';
type AIProcessingStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error';
interface CropCoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
}
interface FaceDetection {
    boundingBox: CropCoordinates;
    landmarks?: Array<{
        x: number;
        y: number;
    }>;
    confidence: number;
}
interface AIDetection {
    type: 'face' | 'subject' | 'text';
    boundingBox: CropCoordinates;
    confidence: number;
    metadata?: Record<string, any>;
}
interface AIProps$2 {
    /** Auto-detect and crop to subject/face */
    smartCrop?: SmartCropMode$1;
    /** Auto-generate alt text using AI */
    autoAlt?: boolean;
    /** Context for better alt text generation */
    altContext?: string;
    /** Auto-enhance portraits */
    enhancePortrait?: boolean;
    /** Portrait enhancement preset */
    portraitPreset?: PortraitPreset;
    /** Minimum confidence for AI detection (0-1) */
    confidenceThreshold?: number;
    /** Enable AI features (default: true) */
    enableAI?: boolean;
    /** Maximum time to wait for AI processing (ms) */
    aiTimeout?: number;
    /** Cache AI results in localStorage */
    aiCache?: boolean;
    /** Callback when AI processing starts */
    onAIStart?: () => void;
    /** Callback when AI processing completes */
    onAIComplete?: (result: AIProcessingResult) => void;
    /** Callback when AI encounters an error */
    onAIError?: (error: Error) => void;
}
interface AIProcessingResult {
    type: AIModelType;
    success: boolean;
    processingTime: number;
    detections?: AIDetection[];
    generatedAlt?: string;
    confidence: number;
    error?: string;
}
interface AIModelInfo {
    type: AIModelType;
    loaded: boolean;
    loading: boolean;
    error?: Error;
    modelSize?: number;
    processingTime?: number;
}
interface AIConfig {
    enabled: boolean;
    autoLoadModels?: boolean;
    maxModelCacheSize?: number;
    processingTimeout?: number;
    fallbackToCenterCrop?: boolean;
    debug?: boolean;
}
interface Dimensions {
    width: number;
    height: number;
    aspectRatio: number;
}
interface ProcessingOptions {
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'original';
    maxWidth?: number;
    maxHeight?: number;
    crop?: CropCoordinates;
}
interface CompressionResult {
    originalSize: number;
    compressedSize: number;
    reduction: string;
    blob: Blob;
    url: string;
}
interface ImageLoadEvent {
    naturalWidth: number;
    naturalHeight: number;
    src: string;
    processingTime: number;
}
interface VideoLoadEvent {
    duration: number;
    videoWidth: number;
    videoHeight: number;
    src: string;
    processingTime: number;
}
interface GlobalConfig {
    defaultQuality?: number;
    defaultWebP?: boolean;
    defaultLazy?: boolean;
    defaultPlaceholder?: 'blur' | 'none';
    defaultBlurIntensity?: number;
    enableAIGlobally?: boolean;
    debug?: boolean;
}

declare function useAIDetection(imageSrc: string, options: {
    smartCrop?: SmartCropMode$1;
    confidenceThreshold?: number;
    enableAI?: boolean;
}): {
    isLoading: boolean;
    detections: FaceDetection[];
    optimalCrop: CropCoordinates | null;
    error: Error | null;
    imageRef: HTMLImageElement | null;
};

type LicenseType = 'CC0' | 'CC BY' | 'CC BY-SA' | 'CC BY-NC' | 'CC BY-ND' | 'CC BY-NC-SA' | 'CC BY-NC-ND' | 'Royalty Free' | 'Commercial' | 'Public Domain' | string;
type PriorityType = 'hero' | 'critical' | 'lazy' | false;
type SmartCropMode = 'face' | 'subject' | 'auto' | 'center' | false;
interface SEOProps$1 {
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
interface PriorityProps$1 {
    priority?: PriorityType;
    fetchPriority?: 'high' | 'low' | 'auto';
}
interface AIProps$1 {
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
interface OptimizedImageProps extends React__default.ImgHTMLAttributes<HTMLImageElement>, SEOProps$1, PriorityProps$1, AIProps$1 {
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
declare const OptimizedImage: React__default.FC<OptimizedImageProps>;

declare module 'react' {
    interface VideoHTMLAttributes<T> {
        fetchPriority?: 'high' | 'low' | 'auto';
    }
}
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
    license?: LicenseType$1;
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
    priority?: PriorityType$1;
    fetchPriority?: 'high' | 'low' | 'auto';
}
interface OptimizedVideoProps extends React__default.VideoHTMLAttributes<HTMLVideoElement>, SEOProps, PriorityProps, AIProps {
    src: string;
    poster?: string;
    lazy?: boolean;
    webm?: boolean;
    mp4?: boolean;
    disableSEO?: boolean;
    showChapters?: boolean;
}
declare const OptimizedVideo: React__default.FC<OptimizedVideoProps>;

interface CompressionOptions {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    mimeType?: 'image/jpeg' | 'image/png' | 'image/webp';
}
/**
 * Compress image using Canvas
 * Browser-only utility
 */
declare function compressImage(file: File, options?: CompressionOptions): Promise<File>;
/**
 * Calculate compression reduction
 */
declare function calculateSizeReduction(originalSize: number, newSize: number): string;

/**
 * Detects WebP support (cached)
 * Safe for SSR
 */
declare function supportsWebP$1(): Promise<boolean>;
/**
 * Converts image URL to .webp by rewriting extension
 * NOTE: Only works if server/CDN supports WebP
 */
declare function convertToWebP$1(src: string): string;

interface DetectionResult {
    detections: FaceDetection[];
    processingTime: number;
    modelUsed: 'short' | 'full';
}
interface FaceDetectionConfig {
    /** Model type: 'short' (fast) or 'full' (accurate) */
    model?: 'short' | 'full';
    /** Minimum confidence threshold (0-1) */
    minConfidence?: number;
    /** Maximum number of faces to detect */
    maxFaces?: number;
    /** Whether to enable landmarks */
    enableLandmarks?: boolean;
    /** Callback for model loading progress */
    onProgress?: (progress: number) => void;
    /** Timeout in milliseconds */
    timeout?: number;
}
/**
 * Initialize face detection with MediaPipe
 */
declare function initializeFaceDetection(config?: FaceDetectionConfig): Promise<boolean>;
/**
 * Detect faces in an image
 */
declare function detectFaces(imageElement: HTMLImageElement | HTMLVideoElement, config?: FaceDetectionConfig): Promise<DetectionResult>;
/**
 * Continuously detect faces in video stream
 */
declare function detectFacesContinuous(imageElement: HTMLImageElement | HTMLVideoElement, onFrame: (detections: FaceDetection[]) => void, config?: FaceDetectionConfig): Promise<() => void>;
/**
 * Check if face detection is supported in current browser
 */
declare function isFaceDetectionSupported$1(): boolean;
/**
 * Get face detection statistics
 */
declare function getFaceDetectionStats(): {
    supported: boolean;
    initialized: boolean;
    modelLoaded: boolean;
    modelType: any;
    version: string;
    memoryUsage: number;
};
/**
 * Reset face detection (cleanup)
 */
declare function resetFaceDetection$1(): void;

interface CaptionResult {
    text: string;
    confidence: number;
    processingTime: number;
    modelUsed: string;
}
interface CaptionConfig {
    /** Maximum length of generated caption */
    maxLength?: number;
    /** Number of beams for beam search (higher = better but slower) */
    numBeams?: number;
    /** Temperature for sampling (higher = more creative) */
    temperature?: number;
    /** Context to append to caption */
    context?: string;
    /** Minimum confidence threshold */
    minConfidence?: number;
    /** Timeout in milliseconds */
    timeout?: number;
    /** Callback for model loading progress */
    onProgress?: (progress: number) => void;
}
/**
 * Initialize the image captioning pipeline
 */
declare function initializeCaptioning(config?: CaptionConfig): Promise<boolean>;
/**
 * Generate caption for an image
 */
declare function generateCaption(imageUrl: string, config?: CaptionConfig): Promise<CaptionResult>;
/**
 * Generate caption with context
 */
declare function generateWithContext(imageUrl: string, context: string, config?: CaptionConfig): Promise<CaptionResult>;
/**
 * Generate multiple caption variations
 */
declare function generateVariations(imageUrl: string, count?: number, config?: CaptionConfig): Promise<CaptionResult[]>;
/**
 * Check if captioning is supported
 */
declare function isCaptioningSupported$1(): boolean;
/**
 * Get captioning statistics
 */
declare function getCaptioningStats(): {
    supported: boolean;
    initialized: boolean;
    modelLoaded: boolean;
    version: string;
    memoryUsage: number;
};
/**
 * Reset captioning (cleanup)
 */
declare function resetCaptioning$1(): void;

interface CropOptions {
    /** Target width in pixels */
    targetWidth: number;
    /** Target height in pixels */
    targetHeight: number;
    /** Padding around subject (0-1), default 0.1 (10%) */
    padding?: number;
    /** Aspect ratio handling: 'preserve' or 'strict' */
    aspectRatio?: 'preserve' | 'strict';
    /** Crop strategy */
    strategy?: 'center' | 'smart' | 'face' | 'subject';
    /** Minimum confidence for detections (0-1) */
    minConfidence?: number;
    /** Whether to prefer wider crops */
    preferWide?: boolean;
}
interface CropResult extends CropCoordinates {
    /** Cropped image URL (if using CDN) */
    url?: string;
    /** Crop strategy used */
    strategyUsed: string;
    /** Confidence of the crop decision */
    confidence: number;
    /** Whether crop was adjusted */
    adjusted: boolean;
}
/**
 * Calculate smart crop based on detections
 */
declare function calculateSmartCrop(imageWidth: number, imageHeight: number, detections: FaceDetection[], mode: SmartCropMode$1, options: CropOptions): CropResult;
/**
 * Calculate center crop (fallback)
 */
declare function calculateCenterCrop(imageWidth: number, imageHeight: number, options: CropOptions): CropCoordinates;
/**
 * Generate CSS object-position from crop coordinates
 */
declare function getCropCSS(crop: CropCoordinates, imageWidth: number, imageHeight: number): React.CSSProperties;
/**
 * Generate cropping URL for CDN (e.g., Cloudinary, Imgix)
 */
declare function getCroppedUrl(originalUrl: string, crop: CropCoordinates): string;
/**
 * Validate crop coordinates
 */
declare function isValidCrop(crop: CropCoordinates, imageWidth: number, imageHeight: number): boolean;
/**
 * Get crop recommendations based on image dimensions
 */
declare function getCropRecommendations(imageWidth: number, imageHeight: number, detections: FaceDetection[]): {
    recommended: CropOptions;
    alternatives: CropOptions[];
};

interface ImageSchemaOptions extends SEOProps$2 {
    url: string;
    alt: string;
    width?: number;
    height?: number;
    isRepresentative?: boolean;
}
interface VideoSchemaOptions {
    url: string;
    poster?: string;
    name: string;
    description: string;
    duration?: number;
    uploadDate: string;
    author?: string;
    license?: string;
    chapters?: VideoChapter[];
    isFamilyFriendly?: boolean;
    keywords?: string[];
    transcript?: string;
    width?: number;
    height?: number;
}
/**
 * Generate JSON-LD schema for images
 */
declare function generateImageSchema(options: ImageSchemaOptions): Record<string, any>;
/**
 * Generate JSON-LD schema for videos (with Key Moments support)
 */
declare function generateVideoSchema(options: VideoSchemaOptions): Record<string, any>;
/**
 * Get license URL from license string
 */
declare function getLicenseUrl(license: string): string;
/**
 * Inject JSON-LD script into document head
 */
declare function injectJsonLd(schema: Record<string, any>): void;
/**
 * Batch inject multiple schemas
 */
declare function injectBatchJsonLd(schemas: Record<string, any>[]): void;
/**
 * Clear all RMO injected schemas
 */
declare function clearAllSchemas(): void;

/**
 * Inject preload link for priority images/videos
 */
declare function injectPreload(src: string, priority: PriorityType$1, resourceType?: 'image' | 'video' | 'font'): void;
/**
 * Get representative flag for schema
 */
declare function getRepresentativeFlag(priority: PriorityType$1): boolean;
/**
 * Preload multiple resources at once
 */
declare function preloadResources(resources: Array<{
    src: string;
    type: 'image' | 'video' | 'font';
    priority: PriorityType$1;
}>): void;
/**
 * Preload critical resources for page
 */
declare function preloadCritical(resources: Array<{
    src: string;
    type: 'image' | 'video';
}>): void;

declare const supportsWebP: typeof supportsWebP$1;
declare const convertToWebP: typeof convertToWebP$1;

declare const isFaceDetectionSupported: typeof isFaceDetectionSupported$1;
declare const resetFaceDetection: typeof resetFaceDetection$1;

declare const isCaptioningSupported: typeof isCaptioningSupported$1;
declare const resetCaptioning: typeof resetCaptioning$1;

declare const modelManager: ModelManager;

declare const VERSION = "1.2.0-beta.1";
declare const AI_VERSION = "1.0.0";
/**
 * Check if AI features are supported in current browser
 */
declare function isAISupported(): boolean;
/**
 * Check if WebP is supported
 */
/**
 * Check if WebP is supported
 */
declare function isWebPSupported(): Promise<boolean>;
/**
 * Check if Intersection Observer is supported
 */
declare function isIntersectionObserverSupported(): boolean;
/**
 * Get package information
 */
declare function getPackageInfo(): {
    name: string;
    version: string;
    aiVersion: string;
    features: {
        seo: boolean;
        videoChapters: boolean;
        faceDetection: boolean;
        autoAlt: boolean;
        smartCrop: boolean;
        smartPoster: boolean;
        autoChapters: boolean;
        preload: boolean;
        compression: boolean;
    };
    browserSupport: {
        ai: boolean;
        webp: Promise<boolean>;
        intersectionObserver: boolean;
    };
};
/**
 * Initialize all AI models (optional)
 */
declare function initializeAI(): Promise<boolean>;
/**
 * Check if specific AI model is ready
 */
declare function isAIModelReady(modelType: 'face' | 'caption'): Promise<boolean>;
/**
 * Get AI model status - FIXED with proper imports
 */
declare function getAIStatus(): {
    faceDetection: {
        supported: boolean;
        initialized: boolean;
    };
    imageCaptioning: {
        supported: boolean;
        initialized: boolean;
    };
};
/**
 * Reset all AI models (cleanup) - FIXED with proper imports
 */
declare function resetAllAI(): void;

export { type AIConfig, type AIDetection, type AIModelInfo, type AIModelType, type AIProcessingResult, type AIProcessingStatus, type AIProps$2 as AIProps, AI_VERSION, type CompressionResult, type CropCoordinates, type Dimensions, type FaceDetection, type GlobalConfig, type ImageLoadEvent, type LicenseType$1 as LicenseType, MODEL_METADATA, MODEL_URLS, OptimizedImage, type OptimizedImageProps$1 as OptimizedImageProps, OptimizedVideo, type OptimizedVideoProps$1 as OptimizedVideoProps, type PortraitPreset, type PriorityProps$2 as PriorityProps, type PriorityType$1 as PriorityType, type ProcessingOptions, type SEOProps$2 as SEOProps, type SmartCropMode$1 as SmartCropMode, VERSION, type VideoChapter, type VideoLoadEvent, type VideoSEOProps, calculateCenterCrop, calculateSizeReduction, calculateSmartCrop, clearAllSchemas, compressImage, convertToWebP, detectFaces, detectFacesContinuous, generateCaption, generateImageSchema, generateVariations, generateVideoSchema, generateWithContext, getAIStatus, getCaptioningStats, getCropCSS, getCropRecommendations, getCroppedUrl, getFaceDetectionStats, getLicenseUrl, getPackageInfo, getRepresentativeFlag, initializeAI, initializeCaptioning, initializeFaceDetection, injectBatchJsonLd, injectJsonLd, injectPreload, isAIModelReady, isAISupported, isCaptioningSupported, isFaceDetectionSupported, isIntersectionObserverSupported, isValidCrop, isWebPSupported, modelManager, preloadCritical, preloadResources, resetAllAI, resetCaptioning, resetFaceDetection, supportsWebP, useAIDetection, useLazyLoad, useOptimizedImage };
