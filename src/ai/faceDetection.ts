// src/ai/faceDetection.ts
import { FaceDetection } from '../types';
import { modelManager, ModelType } from './models';

// MediaPipe types (simplified)
interface MediaPipeFaceDetection {
  setOptions(options: any): void;
  onResults(callback: (results: any) => void): void;
  send(inputs: { image: HTMLImageElement | HTMLVideoElement }): Promise<void>;
  close(): void;
}

interface MediaPipeFaceDetectionConstructor {
  new (config: { locateFile: (file: string) => string }): MediaPipeFaceDetection;
}

let faceDetector: MediaPipeFaceDetection | null = null;
let resultHandler: ((results: any) => void) | null = null;
let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

export interface DetectionResult {
  detections: FaceDetection[];
  processingTime: number;
  modelUsed: 'short' | 'full';
}

export interface FaceDetectionConfig {
  /** Model type: 'short' (fast) or 'full' (accurate) */
  model?: 'short' | 'full';
  
  /** Minimum confidence threshold (0-1) */
  minConfidence?: number;
  
  /** Maximum number of faces to detect */
  maxFaces?: number;
  
  /** Whether to enable landmarks */
  enableLandmarks?: boolean;
  
  /** Callback for model loading progress */
  onProgress?: (progress: number) => void;
  
  /** Timeout in milliseconds */
  timeout?: number;
}

const DEFAULT_CONFIG: Required<FaceDetectionConfig> = {
  model: 'short',
  minConfidence: 0.5,
  maxFaces: 10,
  enableLandmarks: true,
  onProgress: () => {},
  timeout: 30000
};

/**
 * Initialize face detection with MediaPipe
 */
export async function initializeFaceDetection(
  config: FaceDetectionConfig = {}
): Promise<boolean> {
  // Return cached promise if already initializing
  if (initializationPromise) {
    return initializationPromise;
  }

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  initializationPromise = (async () => {
    try {
      console.log('🔄 Initializing face detection...');
      
      // Load MediaPipe face detection model using model manager
      const modelName: ModelType = mergedConfig.model === 'full' ? 'face-full' : 'face-short';
      
      await modelManager.loadModel(modelName, {
        timeout: mergedConfig.timeout,
        onProgress: mergedConfig.onProgress
      });

      // Dynamically import MediaPipe
      const { FaceDetection } = await import('@mediapipe/face_detection') as { 
        FaceDetection: MediaPipeFaceDetectionConstructor 
      };
      
      // Create detector instance
      faceDetector = new FaceDetection({
        locateFile: (file) => {
          // Use cached model if available
          const modelKey = mergedConfig.model === 'full' ? 'face-full' : 'face-short';
          const cachedModel = modelManager['loadedModels'].get(modelKey);
          
          if (cachedModel && file.includes('.tflite')) {
            // TODO: Use cached model buffer
            console.log('📦 Using cached model');
          }
          
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }
      });

      // Configure detector
      faceDetector.setOptions({
        model: mergedConfig.model,
        minDetectionConfidence: mergedConfig.minConfidence,
        maxNumFaces: mergedConfig.maxFaces,
        outputFacialTransformationMatrixes: mergedConfig.enableLandmarks
      });

      // Set up results handler
      faceDetector.onResults((results: any) => {
        if (resultHandler) {
          resultHandler(results);
        }
      });

      isInitialized = true;
      console.log('✅ Face detection initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize face detection:', error);
      isInitialized = false;
      return false;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

/**
 * Detect faces in an image
 */
export async function detectFaces(
  imageElement: HTMLImageElement | HTMLVideoElement,
  config: FaceDetectionConfig = {}
): Promise<DetectionResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Ensure detector is initialized
  if (!faceDetector || !isInitialized) {
    const initialized = await initializeFaceDetection(mergedConfig);
    if (!initialized || !faceDetector) {
      throw new Error('Face detection not available');
    }
  }

  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    // Set up one-time handler
    resultHandler = (results: any) => {
      const processingTime = performance.now() - startTime;
      
      const detections: FaceDetection[] = results.detections?.map((detection: any) => ({
        boundingBox: {
          x: detection.boundingBox.xMin,
          y: detection.boundingBox.yMin,
          width: detection.boundingBox.width,
          height: detection.boundingBox.height,
          confidence: detection.score[0]
        },
        landmarks: mergedConfig.enableLandmarks ? detection.landmarks?.map((lm: any) => ({
          x: lm.x,
          y: lm.y
        })) : undefined
      })) || [];

      // Clear handler after use
      resultHandler = null;
      
      resolve({ 
        detections, 
        processingTime,
        modelUsed: mergedConfig.model || 'short'
      });
    };

    try {
      faceDetector!.send({ image: imageElement }).catch(reject);
    } catch (error) {
      resultHandler = null;
      reject(error);
    }
  });
}

/**
 * Continuously detect faces in video stream
 */
export async function detectFacesContinuous(
  imageElement: HTMLImageElement | HTMLVideoElement,
  onFrame: (detections: FaceDetection[]) => void,
  config: FaceDetectionConfig = {}
): Promise<() => void> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Ensure detector is initialized
  if (!faceDetector || !isInitialized) {
    const initialized = await initializeFaceDetection(mergedConfig);
    if (!initialized || !faceDetector) {
      throw new Error('Face detection not available');
    }
  }

  let isRunning = true;
  let frameCount = 0;
  const fps: number[] = [];

  // Set up continuous handler
  resultHandler = (results: any) => {
    const detections: FaceDetection[] = results.detections?.map((detection: any) => ({
      boundingBox: {
        x: detection.boundingBox.xMin,
        y: detection.boundingBox.yMin,
        width: detection.boundingBox.width,
        height: detection.boundingBox.height,
        confidence: detection.score[0]
      },
      landmarks: mergedConfig.enableLandmarks ? detection.landmarks?.map((lm: any) => ({
        x: lm.x,
        y: lm.y
      })) : undefined
    })) || [];

    // Calculate FPS for performance monitoring
    frameCount++;
    const now = Date.now();
    fps.push(now);
    if (fps.length > 30) fps.shift();
    
    // Calculate and optionally log FPS every 30 frames
    if (frameCount % 30 === 0 && fps.length > 1) {
      const avgFps = (fps.length * 1000) / (fps[fps.length - 1] - fps[0]);
      console.debug(`📹 Face detection FPS: ${avgFps.toFixed(1)}`);
    }

    onFrame(detections);
  };

  // Start continuous detection
  const processFrame = async () => {
    if (!isRunning || !faceDetector || !resultHandler) return;
    
    try {
      await faceDetector.send({ image: imageElement });
      
      // Schedule next frame (target 30fps)
      setTimeout(processFrame, 33);
    } catch (error) {
      console.error('Frame processing error:', error);
      setTimeout(processFrame, 100); // Retry after delay
    }
  };

  processFrame();

  // Return cleanup function
  return () => {
    isRunning = false;
    resultHandler = null;
  };
}

/**
 * Check if face detection is supported in current browser
 */
export function isFaceDetectionSupported(): boolean {
  if (typeof window === 'undefined') return false; // SSR
  
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  })();

  return !!(window as any).MediaStreamTrack && 
         typeof WebAssembly === 'object' &&
         !!WebAssembly.validate &&
         hasWebGL;
}

/**
 * Get face detection statistics
 */
export function getFaceDetectionStats() {
  return {
    supported: isFaceDetectionSupported(),
    initialized: isInitialized,
    modelLoaded: !!faceDetector,
    modelType: isInitialized ? (faceDetector as any)?._options?.model : null,
    version: '1.2.0-beta.1',
    memoryUsage: modelManager.getTotalMemoryUsage()
  };
}

/**
 * Reset face detection (cleanup)
 */
export function resetFaceDetection(): void {
  if (faceDetector) {
    faceDetector.close();
    faceDetector = null;
  }
  resultHandler = null;
  isInitialized = false;
  initializationPromise = null;
}

/**
 * Get available models
 */
export function getAvailableModels(): string[] {
  return modelManager.getAvailableModels().filter(m => m.startsWith('face-'));
}

/**
 * Set face detection config
 */
export function setFaceDetectionConfig(config: FaceDetectionConfig): void {
  if (faceDetector && isInitialized) {
    faceDetector.setOptions({
      minDetectionConfidence: config.minConfidence,
      maxNumFaces: config.maxFaces,
    });
  }
}

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', resetFaceDetection);
}