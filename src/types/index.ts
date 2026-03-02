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