import * as poseDetection from '@tensorflow-models/pose-detection';

// MoveNet keypoint connections (skeleton structure)
const POSE_CONNECTIONS: Array<[number, number]> = [
  [0, 1],   // nose to left_eye
  [0, 2],   // nose to right_eye
  [1, 3],   // left_eye to left_ear
  [2, 4],   // right_eye to right_ear
  [0, 5],   // nose to left_shoulder
  [0, 6],   // nose to right_shoulder
  [5, 6],   // left_shoulder to right_shoulder
  [5, 7],   // left_shoulder to left_elbow
  [7, 9],   // left_elbow to left_wrist
  [6, 8],   // right_shoulder to right_elbow
  [8, 10],  // right_elbow to right_wrist
  [5, 11],  // left_shoulder to left_hip
  [6, 12],  // right_shoulder to right_hip
  [11, 12], // left_hip to right_hip
  [11, 13], // left_hip to left_knee
  [13, 15], // left_knee to left_ankle
  [12, 14], // right_hip to right_knee
  [14, 16], // right_knee to right_ankle
];

export class PoseDrawer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  drawPoses(poses: poseDetection.Pose[], canvasWidth: number, canvasHeight: number): void {
    poses.forEach((pose) => {
      this.drawPose(pose, canvasWidth, canvasHeight);
    });
  }

  private drawPose(pose: poseDetection.Pose, _canvasWidth: number, _canvasHeight: number): void {
    if (!pose.keypoints || pose.keypoints.length === 0) {
      return;
    }

    // Draw skeleton connections
    this.drawSkeleton(pose.keypoints);

    // Draw keypoints
    this.drawKeypoints(pose.keypoints);
  }

  private drawSkeleton(keypoints: poseDetection.Keypoint[]): void {
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 3;

    // Use utility function if available, otherwise use our manual connections
    try {
      // Try to use the library's utility function for adjacent keypoints
      const adjacentKeyPoints = (poseDetection.util as any)?.getAdjacentKeyPoints?.(keypoints, 0.3);
      if (adjacentKeyPoints && adjacentKeyPoints.length > 0) {
        adjacentKeyPoints.forEach((pair: [poseDetection.Keypoint, poseDetection.Keypoint]) => {
          const [from, to] = pair;
          // Coordinates are already in pixels, use directly
          this.ctx.beginPath();
          this.ctx.moveTo(from.x, from.y);
          this.ctx.lineTo(to.x, to.y);
          this.ctx.stroke();
        });
        return;
      }
    } catch (e) {
      // Fall back to manual connections
    }

    // Manual connections (fallback)
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const startKeypoint = keypoints[startIdx];
      const endKeypoint = keypoints[endIdx];

      if (startKeypoint && endKeypoint && 
          (startKeypoint.score ?? 0) > 0.3 && (endKeypoint.score ?? 0) > 0.3) {
        // Coordinates are already in pixels (not normalized), use directly
        this.ctx.beginPath();
        this.ctx.moveTo(startKeypoint.x, startKeypoint.y);
        this.ctx.lineTo(endKeypoint.x, endKeypoint.y);
        this.ctx.stroke();
      }
    });
  }

  private drawKeypoints(keypoints: poseDetection.Keypoint[]): void {
    let drawnCount = 0;
    keypoints.forEach(keypoint => {
      if ((keypoint.score ?? 0) > 0.3) {
        // Coordinates are already in pixels (not normalized), use directly
        const x = keypoint.x;
        const y = keypoint.y;

        // Draw keypoint circle
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Draw white border for visibility
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        drawnCount++;
      }
    });
    
    if (drawnCount === 0) {
      console.warn('No keypoints drawn - all scores below threshold or keypoints missing');
    }
  }
}


