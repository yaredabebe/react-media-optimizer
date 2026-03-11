// src/ai/imageCaptioning.ts
import { modelManager } from './models';

export interface CaptionResult {
  text: string;
  confidence: number;
  processingTime: number;
  modelUsed: string;
}

export interface CaptionConfig {
  /** Maximum length of generated caption */
  maxLength?: number;
  
  /** Number of beams for beam search (higher = better but slower) */
  numBeams?: number;
  
  /** Temperature for sampling (higher = more creative) */
  temperature?: number;
  
  /** Context to append to caption */
  context?: string;
  
  /** Minimum confidence threshold */
  minConfidence?: number;
  
  /** Timeout in milliseconds */
  timeout?: number;
  
  /** Callback for model loading progress */
  onProgress?: (progress: number) => void;
}

const DEFAULT_CONFIG: Required<CaptionConfig> = {
  maxLength: 50,
  numBeams: 4,
  temperature: 1.0,
  context: '',
  minConfidence: 0.3,
  timeout: 30000,
  onProgress: () => {}
};

// Transformers.js types (simplified)
interface Pipeline {
  (input: any, options?: any): Promise<any>;
}

let captioningPipeline: Pipeline | null = null;
let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

/**
 * Initialize the image captioning pipeline
 */
export async function initializeCaptioning(
  config: CaptionConfig = {}
): Promise<boolean> {
  if (captioningPipeline || isInitialized) return true;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      console.log('🔄 Initializing image captioning...');
      
      // Load captioning models using model manager
      await modelManager.loadModel('caption-encoder', {
        timeout: config.timeout,
        onProgress: config.onProgress
      });
      
      await modelManager.loadModel('caption-decoder', {
        timeout: config.timeout,
        onProgress: config.onProgress
      });

      // Dynamically import transformers
      const { pipeline } = await import('@xenova/transformers');
      
      // Initialize pipeline
      captioningPipeline = await pipeline(
        'image-to-text',
        'Xenova/vit-gpt2-image-captioning',
        {
          quantized: true,
          progress_callback: (progress: any) => {
            if (progress.status === 'progress') {
              config.onProgress?.(progress.progress || 0);
            }
          }
        }
      );

      isInitialized = true;
      console.log('✅ Image captioning initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize image captioning:', error);
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

/**
 * Generate caption for an image
 */
export async function generateCaption(
  imageUrl: string,
  config: CaptionConfig = {}
): Promise<CaptionResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = performance.now();

  try {
    // Ensure pipeline is initialized
    if (!captioningPipeline || !isInitialized) {
      const initialized = await initializeCaptioning(mergedConfig);
      if (!initialized || !captioningPipeline) {
        throw new Error('Captioning pipeline not available');
      }
    }

    // Fetch and convert image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), mergedConfig.timeout);

    let blob: Blob;
    try {
      const response = await fetch(imageUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      blob = await response.blob();
    } finally {
      clearTimeout(timeoutId);
    }

    // Generate caption
    const result = await captioningPipeline(blob, {
      max_length: mergedConfig.maxLength,
      num_beams: mergedConfig.numBeams,
      temperature: mergedConfig.temperature,
      do_sample: mergedConfig.temperature > 0,
    });

    const processingTime = performance.now() - startTime;
    
    // Extract caption and confidence
    let text = result[0]?.generated_text || 'Image';
    const confidence = result[0]?.score || 1;

    // Add context if provided
    if (mergedConfig.context && text) {
      text = `${text} - ${mergedConfig.context}`;
    }

    return {
      text,
      confidence,
      processingTime,
      modelUsed: 'vit-gpt2-image-captioning'
    };

  } catch (error) {
    console.error('❌ Caption generation failed:', error);
    return {
      text: '',
      confidence: 0,
      processingTime: performance.now() - startTime,
      modelUsed: 'none'
    };
  }
}

/**
 * Generate caption with context
 */
export async function generateWithContext(
  imageUrl: string,
  context: string,
  config: CaptionConfig = {}
): Promise<CaptionResult> {
  return generateCaption(imageUrl, { ...config, context });
}

/**
 * Generate multiple caption variations
 */
export async function generateVariations(
  imageUrl: string,
  count: number = 3,
  config: CaptionConfig = {}
): Promise<CaptionResult[]> {
  const results: CaptionResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const variationConfig = {
      ...config,
      temperature: (config.temperature || 1.0) + (i * 0.2),
    };
    const result = await generateCaption(imageUrl, variationConfig);
    results.push(result);
  }
  
  return results;
}

/**
 * Check if captioning is supported
 */
export function isCaptioningSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for WebAssembly support (required for transformers.js)
  return typeof WebAssembly === 'object' && !!WebAssembly.validate;
}

/**
 * Get captioning statistics
 */
export function getCaptioningStats() {
  return {
    supported: isCaptioningSupported(),
    initialized: isInitialized,
    modelLoaded: !!captioningPipeline,
    version: '1.2.0-beta.1',
    memoryUsage: modelManager.getTotalMemoryUsage()
  };
}

/**
 * Reset captioning (cleanup)
 */
export function resetCaptioning(): void {
  captioningPipeline = null;
  isInitialized = false;
  initializationPromise = null;
}

/**
 * Get available models
 */
export function getAvailableCaptionModels(): string[] {
  return modelManager.getAvailableModels().filter(m => m.startsWith('caption-'));
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', resetCaptioning);
}