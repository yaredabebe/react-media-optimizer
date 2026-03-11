// src/hooks/useAIDetection.ts
import { useState, useEffect, useRef } from 'react';
import { FaceDetection, CropCoordinates, SmartCropMode } from '../types';

export function useAIDetection(
  imageSrc: string,
  options: {
    smartCrop?: SmartCropMode;
    confidenceThreshold?: number;
    enableAI?: boolean;
  }
) {
  const [isLoading, setIsLoading] = useState(false);
  const [detections, setDetections] = useState<FaceDetection[]>([]);
  const [optimalCrop, setOptimalCrop] = useState<CropCoordinates | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const imageRef = useRef<HTMLImageElement | null>(null);
  const modelRef = useRef<any>(null);

  // Load AI model
  useEffect(() => {
    if (!options.enableAI || !options.smartCrop) return;

    const loadModel = async () => {
      try {
        setIsLoading(true);
        
        // Dynamically import MediaPipe to avoid bundling issues
        const { FaceDetection } = await import('@mediapipe/face_detection');
        
        // Initialize model - FIX 1: Correct MediaPipe API
        const faceDetection = new FaceDetection({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
          }
        });

        // FIX 1: MediaPipe uses setOptions with correct property names
        faceDetection.setOptions({
          model: 'short', // 'short' or 'full' range model
          minDetectionConfidence: options.confidenceThreshold || 0.5,
        });

        faceDetection.onResults((results: any) => {
          if (results.detections?.length > 0) {
            const detections = results.detections.map((detection: any) => ({
              boundingBox: {
                x: detection.boundingBox.xMin,
                y: detection.boundingBox.yMin,
                width: detection.boundingBox.width,
                height: detection.boundingBox.height,
                confidence: detection.score[0]
              },
              landmarks: detection.landmarks
            }));
            
            setDetections(detections);
            
            // FIX 2: Ensure smartCrop is defined before passing
            if (options.smartCrop) {
              const crop = calculateOptimalCrop(detections, options.smartCrop);
              setOptimalCrop(crop);
            }
          }
        });

        modelRef.current = faceDetection;
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
        console.error('Failed to load AI model:', err);
      }
    };

    loadModel();

    return () => {
      // Cleanup
      if (modelRef.current) {
        modelRef.current.close();
      }
    };
  }, [options.enableAI, options.smartCrop, options.confidenceThreshold]);

  // Process image when loaded
  useEffect(() => {
    if (!modelRef.current || !imageSrc || !options.smartCrop) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    
    img.onload = async () => {
      imageRef.current = img;
      
      // Send to MediaPipe for processing
      if (modelRef.current) {
        await modelRef.current.send({ image: img });
      }
    };
  }, [imageSrc, options.smartCrop]);

  // Calculate optimal crop based on detections
  const calculateOptimalCrop = (
    detections: FaceDetection[],
    mode: SmartCropMode
  ): CropCoordinates | null => {
    if (detections.length === 0) return null;

    if (mode === 'face' && detections.length > 0) {
      // Get highest confidence face
      const bestFace = detections.reduce((best, current) => 
        current.boundingBox.confidence > best.boundingBox.confidence ? current : best
      );
      
      return {
        x: Math.max(0, bestFace.boundingBox.x - bestFace.boundingBox.width * 0.1),
        y: Math.max(0, bestFace.boundingBox.y - bestFace.boundingBox.height * 0.1),
        width: bestFace.boundingBox.width * 1.2,
        height: bestFace.boundingBox.height * 1.2,
        confidence: bestFace.boundingBox.confidence
      };
    }

    if (mode === 'auto') {
      // Multiple faces? Return bounding box containing all
      if (detections.length > 1) {
        const minX = Math.min(...detections.map(d => d.boundingBox.x));
        const minY = Math.min(...detections.map(d => d.boundingBox.y));
        const maxX = Math.max(...detections.map(d => d.boundingBox.x + d.boundingBox.width));
        const maxY = Math.max(...detections.map(d => d.boundingBox.y + d.boundingBox.height));
        
        return {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          confidence: detections[0].boundingBox.confidence
        };
      }
      
      // Single face - use face mode
      if (detections.length === 1) {
        return calculateOptimalCrop(detections, 'face');
      }
    }

    return null;
  };

  return {
    isLoading,
    detections,
    optimalCrop,
    error,
    imageRef: imageRef.current
  };
}