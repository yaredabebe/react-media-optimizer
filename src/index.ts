// hooks
export { useOptimizedImage } from './hooks/useOptimizedImage';
export { useLazyLoad } from './hooks/useLazyLoad';

// components
export { OptimizedImage } from './components/OptimizedImage';
export { OptimizedVideo } from './components/OptimizedVideo';

// utils
export {
  compressImage,
  calculateSizeReduction,
} from './utils/compress';

export {
  supportsWebP,
  convertToWebP,
} from './utils/webpConverter';

// NEW SEO exports
export type { 
  OptimizedImageProps,
  SEOProps,
  PriorityProps,
  LicenseType,
  PriorityType,
  VideoChapter  // Add this if you have it
} from './types';

// FIXED: Export both schema generators
export { 
  generateImageSchema,
  generateVideoSchema,  // <-- ADD THIS!
  injectJsonLd,
  getLicenseUrl 
} from './seo/schemaGenerator';

// Add preload exports if you have them
export { 
  injectPreload,
  preloadCritical,
  getRepresentativeFlag 
} from './seo/preloadInjector';