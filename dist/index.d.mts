import * as React$1 from 'react';
import React__default, { RefObject } from 'react';

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
interface OptimizedImageProps$1 extends React__default.ImgHTMLAttributes<HTMLImageElement>, SEOProps$2, PriorityProps$2 {
    src: string;
    lazy?: boolean;
    webp?: boolean;
    quality?: number;
    placeholderSrc?: string;
    placeholder?: 'blur' | 'none';
    blurIntensity?: number;
    fallbackSrc?: string;
    showLoadingIndicator?: boolean;
    /** Disable SEO features if needed */
    disableSEO?: boolean;
}
declare const OptimizedImage: React__default.FC<OptimizedImageProps$1>;

type LicenseType = 'CC0' | 'CC BY' | 'CC BY-SA' | 'CC BY-NC' | 'CC BY-ND' | 'CC BY-NC-SA' | 'CC BY-NC-ND' | 'Royalty Free' | 'Commercial' | 'Public Domain' | string;
type PriorityType = 'hero' | 'critical' | 'lazy' | false;
interface VideoChapter {
    /** Start time in seconds */
    startTime: number;
    /** Chapter title */
    title: string;
    /** Optional thumbnail for the chapter */
    thumbnail?: string;
}
interface SEOProps$1 {
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
interface PriorityProps$1 {
    /** Priority level - hero images get preload + representativeOfPage */
    priority?: PriorityType;
    /** Browser fetch priority hint */
    fetchPriority?: 'high' | 'low' | 'auto';
}
interface OptimizedImageProps extends SEOProps$1, PriorityProps$1 {
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

declare module 'react' {
    interface VideoHTMLAttributes<T> {
        fetchPriority?: 'high' | 'low' | 'auto';
    }
}
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
interface OptimizedVideoProps extends React__default.VideoHTMLAttributes<HTMLVideoElement>, SEOProps, PriorityProps {
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
declare function supportsWebP(): Promise<boolean>;
/**
 * Converts image URL to .webp by rewriting extension
 * NOTE: Only works if server/CDN supports WebP
 */
declare function convertToWebP(src: string): string;

interface ImageSchemaOptions extends SEOProps$1 {
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
 * Inject preload link for priority images/videos
 */
declare function injectPreload(src: string, priority: PriorityType, resourceType?: 'image' | 'video' | 'font'): void;
/**
 * Get representative flag for schema
 */
declare function getRepresentativeFlag(priority: PriorityType): boolean;
/**
 * Preload critical resources for page
 */
declare function preloadCritical(resources: Array<{
    src: string;
    type: 'image' | 'video';
}>): void;

export { type LicenseType, OptimizedImage, type OptimizedImageProps, OptimizedVideo, type PriorityProps$1 as PriorityProps, type PriorityType, type SEOProps$1 as SEOProps, type VideoChapter, calculateSizeReduction, compressImage, convertToWebP, generateImageSchema, generateVideoSchema, getLicenseUrl, getRepresentativeFlag, injectJsonLd, injectPreload, preloadCritical, supportsWebP, useLazyLoad, useOptimizedImage };
