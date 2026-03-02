// src/seo/preloadInjector.ts
import { PriorityType } from '../types';

/**
 * Inject preload link for priority images/videos
 */
export function injectPreload(
  src: string, 
  priority: PriorityType,
  resourceType: 'image' | 'video' | 'font' = 'image'
) {
  if (priority === 'hero' || priority === 'critical') {
    // Remove existing preload for same resource
    const existingLink = document.querySelector(`link[href="${src}"]`);
    if (existingLink) {
      existingLink.remove();
    }

    // Create preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = resourceType;
    link.href = src;
    
    // Add fetch priority hint
    link.fetchPriority = priority === 'hero' ? 'high' : 'auto';
    
    // Add type for videos (helps browser)
    if (resourceType === 'video') {
      link.setAttribute('type', getVideoMimeType(src));
    }
    
    // Add media query for responsive images
    if (resourceType === 'image') {
      link.media = '(min-width: 768px)';
    }
    
    // Add crossOrigin if needed
    if (isCrossOrigin(src)) {
      link.crossOrigin = 'anonymous';
    }
    
    // Inject into head
    document.head.appendChild(link);
    
    // Debug in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ RMO Preload: ${src} (${priority} - ${resourceType})`);
    }
  }
}

/**
 * Get representative flag for schema
 */
export function getRepresentativeFlag(priority: PriorityType): boolean {
  return priority === 'hero' || priority === 'critical';
}

/**
 * Get video MIME type from URL extension
 */
function getVideoMimeType(src: string): string {
  const extension = src.split('?')[0].split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'ogg':
    case 'ogv':
      return 'video/ogg';
    case 'mov':
      return 'video/quicktime';
    case 'avi':
      return 'video/x-msvideo';
    case 'm3u8':
      return 'application/x-mpegURL';
    case 'ts':
      return 'video/MP2T';
    default:
      return 'video/mp4';
  }
}

/**
 * Check if resource is from different origin
 */
function isCrossOrigin(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Preload multiple resources at once
 */
export function preloadResources(
  resources: Array<{ src: string; type: 'image' | 'video' | 'font'; priority: PriorityType }>
) {
  resources.forEach(resource => {
    injectPreload(resource.src, resource.priority, resource.type);
  });
}

/**
 * Preload critical resources for page
 */
export function preloadCritical(
  resources: Array<{ src: string; type: 'image' | 'video' }>
) {
  resources.forEach(resource => {
    injectPreload(resource.src, 'critical', resource.type);
  });
}