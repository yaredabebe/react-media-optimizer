// src/ai/models/index.ts

import { MODEL_URLS, MODEL_METADATA, getFallbackUrls, ModelType, ModelFormat } from './model-urls';

export interface ModelLoadOptions {
  /** Timeout in milliseconds */
  timeout?: number;
  /** Whether to use SIMD if available */
  preferSIMD?: boolean;
  /** Callback for progress updates */
  onProgress?: (progress: number) => void;
}

export interface ModelInfo {
  name: string;
  type: ModelFormat;
  size: number;
  loaded: boolean;
  loading: boolean;
  error?: Error;
  metadata?: typeof MODEL_METADATA[keyof typeof MODEL_METADATA];
}

export class ModelManager {
  private static instance: ModelManager;
  private loadedModels: Map<string, any> = new Map();
  private modelStatus: Map<string, boolean> = new Map(); // true = loading
  private modelErrors: Map<string, Error> = new Map();
  private modelCache: Map<string, ArrayBuffer> = new Map();
  private modelCallbacks: Map<string, ((model: any) => void)[]> = new Map();

  private constructor() {}

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  /**
   * Load a model by name
   */
  async loadModel(
    modelName: ModelType,
    options: ModelLoadOptions = {}
  ): Promise<any> {
    const modelKey = String(modelName);
    
    // Check if already loaded
    if (this.loadedModels.has(modelKey)) {
      return this.loadedModels.get(modelKey);
    }

    // Check if already loading (wait for it)
    if (this.modelStatus.get(modelKey)) {
      return this.waitForModel(modelKey);
    }

    this.modelStatus.set(modelKey, true);
    this.modelErrors.delete(modelKey);

    const primaryUrl = MODEL_URLS[modelName as keyof typeof MODEL_URLS];
    const fallbackUrls = getFallbackUrls(modelKey);
    const allUrls = [primaryUrl, ...fallbackUrls];
    const metadata = MODEL_METADATA[modelName as keyof typeof MODEL_METADATA];

    // Try each URL until one works
    for (let i = 0; i < allUrls.length; i++) {
      const url = allUrls[i];
      try {
        console.log(`🔄 Loading model ${modelName} from ${url} (attempt ${i + 1}/${allUrls.length})`);
        
        const model = await this.loadModelFromUrl(url, metadata?.type || 'onnx', options);
        
        this.loadedModels.set(modelKey, model);
        this.modelStatus.set(modelKey, false);
        
        // Notify any waiters
        if (this.modelCallbacks.has(modelKey)) {
          this.modelCallbacks.get(modelKey)?.forEach(cb => cb(model));
          this.modelCallbacks.delete(modelKey);
        }
        
        console.log(`✅ Model loaded: ${modelName} (${this.getSizeReadable(metadata?.size || 0)})`);
        return model;
        
      } catch (error) {
        console.warn(`❌ Failed to load from ${url}:`, error);
        if (i === allUrls.length - 1) {
          this.modelErrors.set(modelKey, error as Error);
          this.modelStatus.set(modelKey, false);
          throw new Error(`Failed to load model ${modelName} from all sources`);
        }
      }
    }
  }

  /**
   * Load model from specific URL
   */
  private async loadModelFromUrl(
    url: string,
    format: ModelFormat,
    options: ModelLoadOptions
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = options.timeout ? 
      setTimeout(() => controller.abort(), options.timeout) : null;

    try {
      // Fetch model with progress
      const response = await fetch(url, { signal: controller.signal });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      let loaded = 0;
      const chunks: Uint8Array[] = [];

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (options.onProgress && total) {
          options.onProgress((loaded / total) * 100);
        }
      }

      const buffer = new Uint8Array(loaded);
      let position = 0;
      for (const chunk of chunks) {
        buffer.set(chunk, position);
        position += chunk.length;
      }

      // Cache the raw buffer
      this.modelCache.set(url, buffer.buffer);

      // Parse based on format
      return this.parseModel(buffer.buffer, format);

    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * Parse model based on format
   */
  private async parseModel(buffer: ArrayBuffer, format: ModelFormat): Promise<any> {
    switch (format) {
      case 'tflite':
        return this.parseTFLite(buffer);
      case 'onnx':
        return this.parseONNX(buffer);
      case 'json':
        return this.parseJSON(buffer);
      case 'wasm':
        return this.parseWASM(buffer);
      default:
        return buffer;
    }
  }

  private async parseTFLite(buffer: ArrayBuffer): Promise<any> {
    // TensorFlow Lite parsing logic
    // You might want to import '@tensorflow/tfjs-tflite' here
    return {
      buffer,
      type: 'tflite',
      size: buffer.byteLength
    };
  }

  private async parseONNX(buffer: ArrayBuffer): Promise<any> {
    // ONNX parsing logic
    // You might want to import 'onnxruntime-web' here
    return {
      buffer,
      type: 'onnx',
      size: buffer.byteLength
    };
  }

  private async parseJSON(buffer: ArrayBuffer): Promise<any> {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    return JSON.parse(text);
  }

  private async parseWASM(buffer: ArrayBuffer): Promise<any> {
    return await WebAssembly.compile(buffer);
  }

  /**
   * Wait for a model that's currently loading
   */
  private waitForModel(modelKey: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.modelCallbacks.has(modelKey)) {
        this.modelCallbacks.set(modelKey, []);
      }
      this.modelCallbacks.get(modelKey)?.push(resolve);
    });
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(modelName: ModelType): boolean {
    return this.loadedModels.has(String(modelName));
  }

  /**
   * Check if model is loading
   */
  isModelLoading(modelName: ModelType): boolean {
    return this.modelStatus.get(String(modelName)) || false;
  }

  /**
   * Get model error if any
   */
  getModelError(modelName: ModelType): Error | undefined {
    return this.modelErrors.get(String(modelName));
  }

  /**
   * Get all model information
   */
  getModelInfo(): ModelInfo[] {
    return Object.entries(MODEL_METADATA).map(([name, metadata]) => ({
      name,
      type: metadata.type,
      size: metadata.size,
      loaded: this.isModelLoaded(name as ModelType),
      loading: this.isModelLoading(name as ModelType),
      error: this.getModelError(name as ModelType),
      metadata
    }));
  }

  /**
   * Unload a model to free memory
   */
  unloadModel(modelName: ModelType): void {
    const modelKey = String(modelName);
    this.loadedModels.delete(modelKey);
    this.modelStatus.delete(modelKey);
    this.modelErrors.delete(modelKey);
  }

  /**
   * Clear all models from memory
   */
  clearAllModels(): void {
    this.loadedModels.clear();
    this.modelStatus.clear();
    this.modelErrors.clear();
    this.modelCache.clear();
  }

  /**
   * Get total memory used by models
   */
  getTotalMemoryUsage(): number {
    let total = 0;
    for (const model of this.loadedModels.values()) {
      total += model.size || model.byteLength || 0;
    }
    return total;
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return Object.keys(MODEL_METADATA);
  }

  /**
   * Format size in human readable format
   */
  private getSizeReadable(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}

// Export singleton instance
export const modelManager = ModelManager.getInstance();

// Export model URLs and metadata
export { MODEL_URLS, MODEL_METADATA } from './model-urls';
export type { ModelType, ModelFormat } from './model-urls';