import * as React from 'react';
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
    elementRef: React.RefObject<HTMLImageElement>;
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

interface OptimizedImageProps extends React__default.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    lazy?: boolean;
    webp?: boolean;
    quality?: number;
    placeholderSrc?: string;
    placeholder?: 'blur' | 'none';
    blurIntensity?: number;
    fallbackSrc?: string;
    showLoadingIndicator?: boolean;
}
declare const OptimizedImage: React__default.FC<OptimizedImageProps>;

interface OptimizedVideoProps extends React__default.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
    poster?: string;
    lazy?: boolean;
    webm?: boolean;
    mp4?: boolean;
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

export { OptimizedImage, OptimizedVideo, calculateSizeReduction, compressImage, convertToWebP, supportsWebP, useLazyLoad, useOptimizedImage };
