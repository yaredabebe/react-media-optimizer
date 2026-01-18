// src/utils/webpConverter.ts

let cachedWebPSupport: boolean | null = null;

/**
 * Detects WebP support (cached)
 * Safe for SSR
 */
export function supportsWebP(): Promise<boolean> {
  if (cachedWebPSupport !== null) {
    return Promise.resolve(cachedWebPSupport);
  }

  if (typeof window === 'undefined') {
    cachedWebPSupport = false;
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      cachedWebPSupport = img.width > 0 && img.height > 0;
      resolve(cachedWebPSupport);
    };
    img.onerror = () => {
      cachedWebPSupport = false;
      resolve(false);
    };
    img.src =
      'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

/**
 * Converts image URL to .webp by rewriting extension
 * NOTE: Only works if server/CDN supports WebP
 */
export function convertToWebP(src: string): string {
  if (!isRemoteUrl(src)) return src;

  return src.replace(/\.(jpe?g|png)(\?.*)?$/i, '.webp$2');
}

/**
 * Returns optimal image format (simple heuristic)
 */
export function getOptimalFormat(): 'webp' | 'jpeg' | 'png' {
  return 'webp';
}

/* ---------------- helpers ---------------- */

function isRemoteUrl(url: string) {
  return /^https?:\/\//.test(url);
}
