// src/utils/compress.ts

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
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  if (typeof window === 'undefined') {
    throw new Error('compressImage can only run in the browser');
  }

  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    mimeType = 'image/jpeg',
  } = options;

  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await loadImage(objectUrl);

    let { width, height } = img;

    // Resize proportionally
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    ctx.drawImage(img, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, mimeType, quality);

    return new File([blob], replaceExtension(file.name, mimeType), {
      type: mimeType,
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Calculate compression reduction
 */
export function calculateSizeReduction(
  originalSize: number,
  newSize: number
): string {
  const reduction = ((originalSize - newSize) / originalSize) * 100;
  return `${reduction.toFixed(1)}% smaller`;
}

/* ---------------- helpers ---------------- */

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Image compression failed'));
    }, type, quality);
  });
}

function replaceExtension(
  filename: string,
  mimeType: string
): string {
  const ext =
    mimeType === 'image/png'
      ? 'png'
      : mimeType === 'image/webp'
      ? 'webp'
      : 'jpg';

  return filename.replace(/\.\w+$/, `.${ext}`);
}
