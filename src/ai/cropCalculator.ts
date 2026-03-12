// src/ai/cropCalculator.ts
import { CropCoordinates, FaceDetection, SmartCropMode } from '../types';

export interface CropOptions {
  /** Target width in pixels */
  targetWidth: number;
  
  /** Target height in pixels */
  targetHeight: number;
  
  /** Padding around subject (0-1), default 0.1 (10%) */
  padding?: number;
  
  /** Aspect ratio handling: 'preserve' or 'strict' */
  aspectRatio?: 'preserve' | 'strict';
  
  /** Crop strategy */
  strategy?: 'center' | 'smart' | 'face' | 'subject';
  
  /** Minimum confidence for detections (0-1) */
  minConfidence?: number;
  
  /** Whether to prefer wider crops */
  preferWide?: boolean;
}

export interface CropResult extends CropCoordinates {
  /** Cropped image URL (if using CDN) */
  url?: string;
  
  /** Crop strategy used */
  strategyUsed: string;
  
  /** Confidence of the crop decision */
  confidence: number;
  
  /** Whether crop was adjusted */
  adjusted: boolean;
}

const DEFAULT_OPTIONS: Required<CropOptions> = {
  targetWidth: 800,
  targetHeight: 600,
  padding: 0.1,
  aspectRatio: 'strict',
  strategy: 'smart',
  minConfidence: 0.3,
  preferWide: false
};

/**
 * Calculate smart crop based on detections
 */
export function calculateSmartCrop(
  imageWidth: number,
  imageHeight: number,
  detections: FaceDetection[],
  mode: SmartCropMode,
  options: CropOptions
): CropResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const padding = mergedOptions.padding;
  
  // Filter detections by confidence
  const validDetections = detections.filter(
    d => d.boundingBox.confidence >= mergedOptions.minConfidence
  );
  
  let cropBox: CropCoordinates;
  let strategyUsed = mode;

  // Default center crop if no valid detections
  if (validDetections.length === 0) {
    cropBox = calculateCenterCrop(imageWidth, imageHeight, mergedOptions);
    strategyUsed = 'center';
  } else {
    switch (mode) {
      case 'face':
        cropBox = calculateFaceCrop(validDetections, padding);
        strategyUsed = 'face';
        break;
      case 'subject':
        cropBox = calculateSubjectCrop(validDetections, padding);
        strategyUsed = 'subject';
        break;
      case 'auto':
      default:
        cropBox = calculateAutoCrop(validDetections, imageWidth, imageHeight, padding);
        strategyUsed = validDetections.length === 1 ? 'face' : 'subject';
        break;
    }
  }

  // Ensure crop stays within image bounds
  let adjusted = false;
  let clamped = clampCropBox(cropBox, imageWidth, imageHeight);
  
  if (clamped.x !== cropBox.x || clamped.y !== cropBox.y || 
      clamped.width !== cropBox.width || clamped.height !== cropBox.height) {
    adjusted = true;
  }
  
  // Adjust to target aspect ratio
  const adjustedCrop = adjustToAspectRatio(clamped, mergedOptions);
  if (adjustedCrop.width !== clamped.width || adjustedCrop.height !== clamped.height) {
    adjusted = true;
  }

  // Calculate confidence based on detections
  const confidence = validDetections.length > 0
    ? validDetections.reduce((sum, d) => sum + d.boundingBox.confidence, 0) / validDetections.length
    : 1;

  return {
    ...adjustedCrop,
    confidence,
    strategyUsed: strategyUsed as string,
    adjusted
  };
}

/**
 * Calculate crop centered on the best face
 */
function calculateFaceCrop(
  detections: FaceDetection[],
  padding: number
): CropCoordinates {
  // Find the highest confidence face
  const bestFace = detections.reduce((best, current) => 
    current.boundingBox.confidence > best.boundingBox.confidence ? current : best
  );

  const face = bestFace.boundingBox;
  
  // Add padding around the face
  const paddedWidth = face.width * (1 + padding * 2);
  const paddedHeight = face.height * (1 + padding * 2);
  
  // Center the crop on the face
  const centerX = face.x + face.width / 2;
  const centerY = face.y + face.height / 2;
  
  return {
    x: Math.max(0, centerX - paddedWidth / 2),
    y: Math.max(0, centerY - paddedHeight / 2),
    width: paddedWidth,
    height: paddedHeight,
    confidence: face.confidence
  };
}

/**
 * Calculate crop containing all subjects
 */
function calculateSubjectCrop(
  detections: FaceDetection[],
  padding: number
): CropCoordinates {
  // Combine all detections into one bounding box
  const minX = Math.min(...detections.map(d => d.boundingBox.x));
  const minY = Math.min(...detections.map(d => d.boundingBox.y));
  const maxX = Math.max(...detections.map(d => d.boundingBox.x + d.boundingBox.width));
  const maxY = Math.max(...detections.map(d => d.boundingBox.y + d.boundingBox.height));
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Add padding around the combined box
  const paddedWidth = width * (1 + padding * 2);
  const paddedHeight = height * (1 + padding * 2);
  
  // Center the crop
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;
  
  return {
    x: Math.max(0, centerX - paddedWidth / 2),
    y: Math.max(0, centerY - paddedHeight / 2),
    width: paddedWidth,
    height: paddedHeight,
    confidence: detections[0].boundingBox.confidence
  };
}

/**
 * Auto-select crop strategy based on detections
 */
function calculateAutoCrop(
  detections: FaceDetection[],
  imageWidth: number,
  imageHeight: number,
  padding: number
): CropCoordinates {
  if (detections.length === 1) {
    return calculateFaceCrop(detections, padding);
  }
  
  if (detections.length > 1) {
    return calculateSubjectCrop(detections, padding);
  }
  
  return calculateCenterCrop(imageWidth, imageHeight, {
    targetWidth: imageWidth,
    targetHeight: imageHeight,
    padding
  });
}

/**
 * Calculate center crop (fallback)
 */
export function calculateCenterCrop(
  imageWidth: number,
  imageHeight: number,
  options: CropOptions
): CropCoordinates {
  const targetAspect = options.targetWidth / options.targetHeight;
  let cropWidth = imageWidth;
  let cropHeight = imageWidth / targetAspect;
  
  if (cropHeight > imageHeight) {
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetAspect;
  }
  
  return {
    x: (imageWidth - cropWidth) / 2,
    y: (imageHeight - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
    confidence: 1
  };
}

/**
 * Ensure crop stays within image bounds
 */
function clampCropBox(
  crop: CropCoordinates,
  imageWidth: number,
  imageHeight: number
): CropCoordinates {
  return {
    x: Math.max(0, Math.min(crop.x, imageWidth - crop.width)),
    y: Math.max(0, Math.min(crop.y, imageHeight - crop.height)),
    width: Math.min(crop.width, imageWidth - crop.x),
    height: Math.min(crop.height, imageHeight - crop.y),
    confidence: crop.confidence
  };
}

/**
 * Adjust crop to target aspect ratio
 */
function adjustToAspectRatio(
  crop: CropCoordinates,
  options: Required<CropOptions>
): CropCoordinates {
  if (options.aspectRatio === 'preserve') {
    return crop;
  }

  const targetAspect = options.targetWidth / options.targetHeight;
  const currentAspect = crop.width / crop.height;

  if (Math.abs(currentAspect - targetAspect) < 0.01) {
    return crop;
  }

  if (currentAspect > targetAspect) {
    // Too wide, adjust width
    const newWidth = crop.height * targetAspect;
    return {
      ...crop,
      x: crop.x + (crop.width - newWidth) / 2,
      width: newWidth,
      confidence: crop.confidence
    };
  } else {
    // Too tall, adjust height
    const newHeight = crop.width / targetAspect;
    return {
      ...crop,
      y: crop.y + (crop.height - newHeight) / 2,
      height: newHeight,
      confidence: crop.confidence
    };
  }
}

/**
 * Generate CSS object-position from crop coordinates
 */
export function getCropCSS(
  crop: CropCoordinates,
  imageWidth: number,
  imageHeight: number
): React.CSSProperties {
  const xPercent = (crop.x / (imageWidth - crop.width)) * 100;
  const yPercent = (crop.y / (imageHeight - crop.height)) * 100;
  
  return {
    objectPosition: `${isFinite(xPercent) ? xPercent : 50}% ${isFinite(yPercent) ? yPercent : 50}%`,
    objectFit: 'cover'
  };
}

/**
 * Generate cropping URL for CDN (e.g., Cloudinary, Imgix)
 */
export function getCroppedUrl(
  originalUrl: string,
  crop: CropCoordinates
): string {
  const url = new URL(originalUrl);
  
  // Add crop parameters (format may vary by CDN)
  url.searchParams.append('crop', `${Math.round(crop.x)},${Math.round(crop.y)},${Math.round(crop.width)},${Math.round(crop.height)}`);
  url.searchParams.append('fit', 'crop');
  
  return url.toString();
}

/**
 * Validate crop coordinates
 */
export function isValidCrop(
  crop: CropCoordinates,
  imageWidth: number,
  imageHeight: number
): boolean {
  return crop.x >= 0 &&
         crop.y >= 0 &&
         crop.width > 0 &&
         crop.height > 0 &&
         crop.x + crop.width <= imageWidth &&
         crop.y + crop.height <= imageHeight;
}

/**
 * Get crop recommendations based on image dimensions
 */
export function getCropRecommendations(
  imageWidth: number,
  imageHeight: number,
  detections: FaceDetection[]
): {
  recommended: CropOptions;
  alternatives: CropOptions[];
} {
  // Use the parameters to avoid unused variable warnings
  const hasDetections = detections.length > 0;
  const aspectRatio = imageWidth / imageHeight;
  
  // Log debug info in development
  if (process.env.NODE_ENV === 'development') {
    console.debug('📐 Crop recommendations:', {
      imageWidth,
      imageHeight,
      aspectRatio: aspectRatio.toFixed(2),
      hasDetections,
      detectionCount: detections.length
    });
  }
  
  // Base recommendations
  const recommendations: CropOptions[] = [
    { targetWidth: 800, targetHeight: 600, strategy: 'smart' }, // 4:3
    { targetWidth: 1200, targetHeight: 630, strategy: 'smart' }, // 19:10 (OG)
    { targetWidth: 1080, targetHeight: 1080, strategy: hasDetections ? 'face' : 'center' }, // 1:1 (Instagram)
    { targetWidth: 1920, targetHeight: 1080, strategy: hasDetections ? 'subject' : 'smart' } // 16:9
  ];

  return {
    recommended: recommendations[0],
    alternatives: recommendations.slice(1)
  };
}

/**
 * Get best crop strategy based on detections only
 * (Removed unused targetAspect parameter)
 */
export function getBestStrategy(
  detections: FaceDetection[]
): SmartCropMode {
  if (detections.length === 0) return 'center';
  if (detections.length === 1) return 'face';
  if (detections.length > 1) return 'subject';
  return 'auto';
}