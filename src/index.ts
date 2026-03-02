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
  PriorityType 
} from './types';

export { generateImageSchema } from './seo/schemaGenerator';