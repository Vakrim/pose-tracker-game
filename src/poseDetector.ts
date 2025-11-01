import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

export class PoseDetector {
  private detector: poseDetection.PoseDetector | null = null;

  async initialize(): Promise<void> {
    // Wait for TensorFlow.js to be ready
    await tf.ready();
    
    // Set backend to webgl (more stable than webgpu on Windows)
    // If webgl is not available, it will fall back automatically
    try {
      await tf.setBackend('webgl');
      await tf.ready();
    } catch (error) {
      console.warn('Could not set webgl backend, using default:', error);
    }

    // Initialize MoveNet model
    const detectorConfig: poseDetection.MoveNetModelConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
      multiPoseMaxDimension: 256,
      enableTracking: false,
      trackerType: poseDetection.TrackerType.BoundingBox,
      modelUrl: undefined, // Use default model
      minPoseScore: 0.25
    };

    this.detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );
  }

  async detect(video: HTMLVideoElement): Promise<poseDetection.Pose[] | null> {
    if (!this.detector) {
      return null;
    }

    try {
      const poses = await this.detector.estimatePoses(video);
      return poses;
    } catch (error) {
      console.error('Error detecting poses:', error);
      return null;
    }
  }

  dispose(): void {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
  }
}

