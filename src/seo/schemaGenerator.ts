// src/seo/schemaGenerator.ts
import { SEOProps } from '../types';
import { VideoChapter } from '../components/OptimizedVideo';

export interface ImageSchemaOptions extends SEOProps {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  isRepresentative?: boolean;
}

export interface VideoSchemaOptions {
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
export function generateImageSchema(options: ImageSchemaOptions): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    'contentUrl': options.url,
    'name': options.alt,
  };

  // Add description if caption provided
  if (options.caption) {
    schema['description'] = options.caption;
  } else if (options.alt) {
    schema['description'] = options.alt;
  }

  // Add license for "Licensable" badge (CRITICAL for Google Images)
  if (options.license) {
    schema['license'] = getLicenseUrl(options.license);
  }

  // Add author for E-E-AT
  if (options.author) {
    schema['author'] = {
      '@type': 'Person',
      'name': options.author
    };
  }

  // Add credit
  if (options.credit) {
    schema['creditText'] = options.credit;
  }

  // Add dimensions
  if (options.width && options.height) {
    schema['width'] = options.width;
    schema['height'] = options.height;
  }

  // Add family friendly flag
  if (options.isFamilyFriendly !== undefined) {
    schema['isFamilyFriendly'] = options.isFamilyFriendly;
  }

  // Add keywords
  if (options.keywords && options.keywords.length > 0) {
    schema['keywords'] = options.keywords.join(', ');
  }

  // Add location
  if (options.contentLocation) {
    schema['contentLocation'] = options.contentLocation;
  }

  // Add copyright
  if (options.copyrightHolder) {
    schema['copyrightHolder'] = {
      '@type': 'Organization',
      'name': options.copyrightHolder
    };
  }

  // Add publication date
  if (options.datePublished) {
    schema['datePublished'] = options.datePublished;
  }

  // Mark as representative of page for hero images (SEO boost)
  if (options.isRepresentative) {
    schema['representativeOfPage'] = true;
  }

  return schema;
}

/**
 * Generate JSON-LD schema for videos (with Key Moments support)
 */
export function generateVideoSchema(options: VideoSchemaOptions): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'name': options.name,
    'description': options.description,
    'thumbnailUrl': options.poster || options.url,
    'uploadDate': options.uploadDate,
    'contentUrl': options.url,
  };

  // Add duration (format: PT1H30M15S) - Important for rich snippets
  if (options.duration) {
    schema['duration'] = formatDuration(options.duration);
  }

  // Add author for E-E-AT
  if (options.author) {
    schema['author'] = {
      '@type': 'Person',
      'name': options.author
    };
  }

  // Add license
  if (options.license) {
    schema['license'] = getLicenseUrl(options.license);
  }

  // Add family friendly flag
  if (options.isFamilyFriendly !== undefined) {
    schema['isFamilyFriendly'] = options.isFamilyFriendly;
  }

  // Add keywords
  if (options.keywords && options.keywords.length > 0) {
    schema['keywords'] = options.keywords.join(', ');
  }

  // Add transcript (accessibility + SEO)
  if (options.transcript) {
    schema['transcript'] = options.transcript;
  }

  // Add dimensions
  if (options.width && options.height) {
    schema['width'] = options.width;
    schema['height'] = options.height;
  }

  // ADD KEY MOMENTS (Video Chapters) - This is the GOLD for Google Video SEO
  if (options.chapters && options.chapters.length > 0) {
    schema['hasPart'] = options.chapters.map((chapter, index) => {
      const nextChapter = options.chapters![index + 1];
      const endTime = nextChapter ? nextChapter.startTime : (options.duration || chapter.startTime + 60);
      
      return {
        '@type': 'Clip',
        'name': chapter.title,
        'startOffset': chapter.startTime,
        'endOffset': endTime,
        'url': `${options.url}#t=${chapter.startTime}`
      };
    });
  }

  // Add potential action (watch video)
  schema['potentialAction'] = {
    '@type': 'WatchAction',
    'target': options.url
  };

  return schema;
}

/**
 * Format seconds to ISO 8601 duration (PT1H30M15S)
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0) duration += `${secs}S`;

  return duration;
}

/**
 * Get license URL from license string
 */
export function getLicenseUrl(license: string): string {
  const licenseMap: Record<string, string> = {
    // Creative Commons Licenses
    'CC0': 'https://creativecommons.org/publicdomain/zero/1.0/',
    'CC BY': 'https://creativecommons.org/licenses/by/4.0/',
    'CC BY-SA': 'https://creativecommons.org/licenses/by-sa/4.0/',
    'CC BY-NC': 'https://creativecommons.org/licenses/by-nc/4.0/',
    'CC BY-ND': 'https://creativecommons.org/licenses/by-nd/4.0/',
    'CC BY-NC-SA': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    'CC BY-NC-ND': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    
    // Standard Licenses
    'Royalty Free': 'https://schema.org/RoyaltyFree',
    'Commercial': 'https://schema.org/Commercial',
    'Public Domain': 'https://creativecommons.org/publicdomain/mark/1.0/',
    'All Rights Reserved': 'https://schema.org/AllRightsReserved',
    
    // Additional
    'MIT': 'https://opensource.org/licenses/MIT',
    'Apache 2.0': 'https://www.apache.org/licenses/LICENSE-2.0'
  };
  
  return licenseMap[license] || license;
}

/**
 * Inject JSON-LD script into document head (Enhanced version)
 */
export function injectJsonLd(schema: Record<string, any>) {
  // Check if we're in browser environment
  if (typeof document === 'undefined') return;

  // Create a unique ID based on content URL to avoid duplicates
  const url = schema.contentUrl || schema.url || '';
  const schemaId = `rmo-schema-${hashCode(url).toString(36)}`;
  
  // Remove existing script with same ID if any
  const existingScript = document.getElementById(schemaId);
  if (existingScript) {
    existingScript.remove();
  }

  // Create new script
  const script = document.createElement('script');
  script.id = schemaId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema, null, 2); // Pretty print for debugging
  
  // Inject into head
  document.head.appendChild(script);
  
  // Debug log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📸 RMO Schema injected (${schema['@type']}):`, schema);
  }
}

/**
 * Simple hash function for creating unique IDs
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Batch inject multiple schemas
 */
export function injectBatchJsonLd(schemas: Record<string, any>[]) {
  schemas.forEach(schema => injectJsonLd(schema));
}

/**
 * Clear all RMO injected schemas
 */
export function clearAllSchemas() {
  if (typeof document === 'undefined') return;
  
  const scripts = document.querySelectorAll('script[id^="rmo-schema-"]');
  scripts.forEach(script => script.remove());
}