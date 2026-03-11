// src/types/index.ts



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

// NEW: Video Chapter Interface
export interface VideoChapter {
  /** Start time in seconds */
  startTime: number;
  
  /** Chapter title */
  title: string;
  
  /** Optional thumbnail for the chapter */
  thumbnail?: string;
}

export interface SEOProps {
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

export interface PriorityProps {
  /** Priority level - hero images get preload + representativeOfPage */
  priority?: PriorityType;
  
  /** Browser fetch priority hint */
  fetchPriority?: 'high' | 'low' | 'auto';
}

// Extended props for OptimizedImage
export interface OptimizedImageProps extends SEOProps, PriorityProps {
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

// NEW: Video SEO Props (if you want to add them here too)
export interface VideoSEOProps {
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

// Extended props for OptimizedVideo
export interface OptimizedVideoProps extends VideoSEOProps, PriorityProps {
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

// v1.2.0 AI Types
// ============================================

export type SmartCropMode = 'face' | 'subject' | 'auto' | 'center' | false;
export type PortraitPreset = 'natural' | 'professional' | 'dramatic';
export type AIModelType = 'face-detection' | 'image-captioning' | 'portrait-enhancement';
export type AIProcessingStatus = 'idle' | 'loading' | 'processing' | 'success' | 'error';

export interface CropCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface FaceDetection {
  boundingBox: CropCoordinates;
  landmarks?: Array<{x: number, y: number}>;
  confidence: number;
}

export interface AIDetection {
  type: 'face' | 'subject' | 'text';
  boundingBox: CropCoordinates;
  confidence: number;
  metadata?: Record<string, any>;
}

export interface AIProps {
  /** Auto-detect and crop to subject/face */
  smartCrop?: SmartCropMode;
  
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

export interface AIProcessingResult {
  type: AIModelType;
  success: boolean;
  processingTime: number;
  detections?: AIDetection[];
  generatedAlt?: string;
  confidence: number;
  error?: string;
}

export interface AIModelInfo {
  type: AIModelType;
  loaded: boolean;
  loading: boolean;
  error?: Error;
  modelSize?: number; // bytes
  processingTime?: number; // ms average
}

export interface AIConfig {
  enabled: boolean;
  autoLoadModels?: boolean;
  maxModelCacheSize?: number; // MB
  processingTimeout?: number; // ms
  fallbackToCenterCrop?: boolean;
  debug?: boolean;
}

// ============================================
// Utility Types
// ============================================

export interface Dimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface ProcessingOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'original';
  maxWidth?: number;
  maxHeight?: number;
  crop?: CropCoordinates;
}

export interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  reduction: string;
  blob: Blob;
  url: string;
}

// ============================================
// Event Types
// ============================================

export interface ImageLoadEvent {
  naturalWidth: number;
  naturalHeight: number;
  src: string;
  processingTime: number;
}

export interface VideoLoadEvent {
  duration: number;
  videoWidth: number;
  videoHeight: number;
  src: string;
  processingTime: number;
}

// ============================================
// Configuration
// ============================================

export interface GlobalConfig {
  defaultQuality?: number;
  defaultWebP?: boolean;
  defaultLazy?: boolean;
  defaultPlaceholder?: 'blur' | 'none';
  defaultBlurIntensity?: number;
  enableAIGlobally?: boolean;
  debug?: boolean;
}