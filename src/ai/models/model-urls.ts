// src/ai/models/model-urls.ts

/**
 * CDN URLs for AI models used in react-media-optimizer v1.2.0
 * Models are loaded dynamically only when needed
 */

export const MODEL_URLS = {
  // ============================================
  // Face Detection Models (MediaPipe)
  // ============================================
  
  /** Fast face detection model - smaller size, faster inference */
  FACE_SHORT: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection_short.tflite',
  
  /** Accurate face detection model - better quality, larger size */
  FACE_FULL: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection_full.tflite',
  
  /** Face detection WASM binary */
  FACE_WASM: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection_wasm_bin.wasm',
  
  /** Face detection SIMD WASM (faster on supported browsers) */
  FACE_SIMD: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/face_detection_wasm_simd.wasm',

  // ============================================
  // Image Captioning Models (Transformers.js)
  // ============================================
  
  /** Vision encoder model - converts image to features */
  CAPTION_ENCODER: 'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/onnx/encoder_model.onnx',
  
  /** Text decoder model - generates captions from features */
  CAPTION_DECODER: 'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/onnx/decoder_model.onnx',
  
  /** Vocabulary file for tokenizing text */
  CAPTION_VOCAB: 'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/vocab.json',
  
  /** Tokenizer config */
  CAPTION_TOKENIZER: 'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/tokenizer.json',
  
  /** Model config */
  CAPTION_CONFIG: 'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/config.json',
  
  /** Merged model (encoder + decoder combined) - for advanced usage */
  CAPTION_MERGED: 'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/onnx/model.onnx',
};

/**
 * Model metadata for better management
 */
export const MODEL_METADATA = {
  'face-short': {
    url: MODEL_URLS.FACE_SHORT,
    size: 2_100_000, // ~2.1 MB
    type: 'tflite',
    description: 'Fast face detection (short range)',
    supported: true,
    version: '0.4.0'
  },
  'face-full': {
    url: MODEL_URLS.FACE_FULL,
    size: 4_200_000, // ~4.2 MB
    type: 'tflite',
    description: 'Accurate face detection (full range)',
    supported: true,
    version: '0.4.0'
  },
  'caption-encoder': {
    url: MODEL_URLS.CAPTION_ENCODER,
    size: 5_100_000, // ~5.1 MB
    type: 'onnx',
    description: 'Image captioning encoder',
    supported: true,
    version: '2.5.0'
  },
  'caption-decoder': {
    url: MODEL_URLS.CAPTION_DECODER,
    size: 3_200_000, // ~3.2 MB
    type: 'onnx',
    description: 'Image captioning decoder',
    supported: true,
    version: '2.5.0'
  },
  'caption-vocab': {
    url: MODEL_URLS.CAPTION_VOCAB,
    size: 1_100_000, // ~1.1 MB
    type: 'json',
    description: 'Vocabulary for tokenization',
    supported: true,
    version: '2.5.0'
  }
} as const;

/**
 * CDN fallback URLs in case primary CDN fails
 */
export const MODEL_FALLBACK_URLS = {
  'face-short': [
    'https://unpkg.com/@mediapipe/face_detection/face_detection_short.tflite',
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.0/face_detection_short.tflite',
    'https://raw.githubusercontent.com/google/mediapipe/master/mediapipe/modules/face_detection/face_detection_short.tflite'
  ],
  'face-full': [
    'https://unpkg.com/@mediapipe/face_detection/face_detection_full.tflite',
    'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.0/face_detection_full.tflite'
  ],
  'caption-encoder': [
    'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/onnx/encoder_model.onnx',
    'https://cdn.huggingface.co/Xenova/vit-gpt2-image-captioning/onnx/encoder_model.onnx',
    'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/onnx/encoder_model.onnx'
  ],
  'caption-decoder': [
    'https://huggingface.co/Xenova/vit-gpt2-image-captioning/resolve/main/onnx/decoder_model.onnx',
    'https://cdn.huggingface.co/Xenova/vit-gpt2-image-captioning/onnx/decoder_model.onnx'
  ]
};

/**
 * Get the best available URL for a model
 */
export function getModelUrl(modelName: keyof typeof MODEL_URLS): string {
  return MODEL_URLS[modelName];
}

/**
 * Get fallback URLs for a model
 */
export function getFallbackUrls(modelName: string): string[] {
  return MODEL_FALLBACK_URLS[modelName as keyof typeof MODEL_FALLBACK_URLS] || [];
}

/**
 * Check if a model URL is accessible
 */
export async function checkModelUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get model size in human readable format
 */
export function getModelSizeReadable(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Model type definitions
 */
export type ModelType = 'face-short' | 'face-full' | 'caption-encoder' | 'caption-decoder' | 'caption-vocab';
export type ModelFormat = 'tflite' | 'onnx' | 'json' | 'wasm';