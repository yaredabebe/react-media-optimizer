// src/types/index.ts

// SEO Types for v1.1.0
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