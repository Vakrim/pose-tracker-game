import * as poseDetection from "@tensorflow-models/pose-detection";

const KEYPOINTS_INDEX = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};

export function getRightWrist(
  canvasWidth: number,
  pose: poseDetection.Pose,
): poseDetection.Keypoint | null {
  const candidate = pose.keypoints[KEYPOINTS_INDEX.RIGHT_WRIST];

  if (!candidate.score || candidate.score < 0.3) {
    return null;
  }

  return { x: canvasWidth - candidate.x, y: candidate.y };
}

export function getLeftWrist(
  canvasWidth: number,
  pose: poseDetection.Pose,
): poseDetection.Keypoint | null {
  const candidate = pose.keypoints[KEYPOINTS_INDEX.LEFT_WRIST];

  if (!candidate.score || candidate.score < 0.3) {
    return null;
  }

  return { x: canvasWidth - candidate.x, y: candidate.y };
}

// MoveNet keypoint connections (skeleton structure)
const POSE_CONNECTIONS: Array<[number, number]> = [
  // [KEYPOINTS_INDEX.NOSE, KEYPOINTS_INDEX.LEFT_EYE], // nose to left_eye
  // [KEYPOINTS_INDEX.NOSE, KEYPOINTS_INDEX.RIGHT_EYE], // nose to right_eye
  // [KEYPOINTS_INDEX.LEFT_EYE, KEYPOINTS_INDEX.LEFT_EAR], // left_eye to left_ear
  // [KEYPOINTS_INDEX.RIGHT_EYE, KEYPOINTS_INDEX.RIGHT_EAR], // right_eye to right_ear
  // [KEYPOINTS_INDEX.NOSE, KEYPOINTS_INDEX.LEFT_SHOULDER], // nose to left_shoulder
  // [KEYPOINTS_INDEX.NOSE, KEYPOINTS_INDEX.RIGHT_SHOULDER], // nose to right_shoulder
  [KEYPOINTS_INDEX.LEFT_SHOULDER, KEYPOINTS_INDEX.RIGHT_SHOULDER], // left_shoulder to right_shoulder
  [KEYPOINTS_INDEX.LEFT_SHOULDER, KEYPOINTS_INDEX.LEFT_ELBOW], // left_shoulder to left_elbow
  [KEYPOINTS_INDEX.LEFT_ELBOW, KEYPOINTS_INDEX.LEFT_WRIST], // left_elbow to left_wrist
  [KEYPOINTS_INDEX.RIGHT_SHOULDER, KEYPOINTS_INDEX.RIGHT_ELBOW], // right_shoulder to right_elbow
  [KEYPOINTS_INDEX.RIGHT_ELBOW, KEYPOINTS_INDEX.RIGHT_WRIST], // right_elbow to right_wrist
  [KEYPOINTS_INDEX.LEFT_SHOULDER, KEYPOINTS_INDEX.LEFT_HIP], // left_shoulder to left_hip
  [KEYPOINTS_INDEX.RIGHT_SHOULDER, KEYPOINTS_INDEX.RIGHT_HIP], // right_shoulder to right_hip
  [KEYPOINTS_INDEX.LEFT_HIP, KEYPOINTS_INDEX.RIGHT_HIP], // left_hip to right_hip
  [KEYPOINTS_INDEX.LEFT_HIP, KEYPOINTS_INDEX.LEFT_KNEE], // left_hip to left_knee
  [KEYPOINTS_INDEX.LEFT_KNEE, KEYPOINTS_INDEX.LEFT_ANKLE], // left_knee to left_ankle
  [KEYPOINTS_INDEX.RIGHT_HIP, KEYPOINTS_INDEX.RIGHT_KNEE], // right_hip to right_knee
  [KEYPOINTS_INDEX.RIGHT_KNEE, KEYPOINTS_INDEX.RIGHT_ANKLE], // right_knee to right_ankle
];

export class PoseDrawer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  drawPoses(
    poses: poseDetection.Pose[],
    canvasWidth: number,
    canvasHeight: number,
  ): void {
    poses.forEach((pose) => {
      this.drawPose(pose, canvasWidth, canvasHeight);
    });
  }

  private drawPose(
    pose: poseDetection.Pose,
    canvasWidth: number,
    _canvasHeight: number,
  ): void {
    if (!pose.keypoints || pose.keypoints.length === 0) {
      return;
    }

    // Draw skeleton connections
    this.drawSkeleton(pose.keypoints, canvasWidth);

    // Draw keypoints
    // this.drawKeypoints(pose.keypoints, canvasWidth);

    // Draw wrist labels
    this.drawWristLabels(pose.keypoints, canvasWidth);
  }

  private drawSkeleton(
    keypoints: poseDetection.Keypoint[],
    canvasWidth: number,
  ): void {
    this.ctx.strokeStyle = "#00ff00";
    this.ctx.lineWidth = 3;

    // Manual connections (fallback)
    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const startKeypoint = keypoints[startIdx];
      const endKeypoint = keypoints[endIdx];

      if (
        startKeypoint &&
        endKeypoint &&
        (startKeypoint.score ?? 0) > 0.3 &&
        (endKeypoint.score ?? 0) > 0.3
      ) {
        // Flip x coordinates horizontally to match flipped video
        const startX = canvasWidth - startKeypoint.x;
        const startY = startKeypoint.y;
        const endX = canvasWidth - endKeypoint.x;
        const endY = endKeypoint.y;

        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
      }
    });
  }

  private drawKeypoints(
    keypoints: poseDetection.Keypoint[],
    canvasWidth: number,
  ): void {
    let drawnCount = 0;
    keypoints.forEach((keypoint) => {
      if ((keypoint.score ?? 0) > 0.3) {
        // Flip x coordinate horizontally to match flipped video
        const x = canvasWidth - keypoint.x;
        const y = keypoint.y;

        // Draw keypoint circle
        this.ctx.fillStyle = "#ff0000";
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, 2 * Math.PI);
        this.ctx.fill();

        // Draw white border for visibility
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        drawnCount++;
      }
    });

    if (drawnCount === 0) {
      console.warn(
        "No keypoints drawn - all scores below threshold or keypoints missing",
      );
    }
  }

  private drawWristLabels(
    keypoints: poseDetection.Keypoint[],
    canvasWidth: number,
  ): void {
    // Configure text style
    this.ctx.font = "bold 24px Arial";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "#ffff00"; // Yellow text
    this.ctx.strokeStyle = "#000000"; // Black outline
    this.ctx.lineWidth = 3;

    // Draw "L" at left wrist
    const leftWrist = keypoints[KEYPOINTS_INDEX.LEFT_WRIST];
    if (leftWrist && (leftWrist.score ?? 0) > 0.3) {
      // Flip x coordinate horizontally to match flipped video
      const x = canvasWidth - leftWrist.x;
      const y = leftWrist.y - 30; // Position above the wrist

      // Draw text with outline for visibility
      this.ctx.strokeText("L", x, y);
      this.ctx.fillText("L", x, y);
    }

    // Draw "R" at right wrist
    const rightWrist = keypoints[KEYPOINTS_INDEX.RIGHT_WRIST];
    if (rightWrist && (rightWrist.score ?? 0) > 0.3) {
      // Flip x coordinate horizontally to match flipped video
      const x = canvasWidth - rightWrist.x;
      const y = rightWrist.y - 30; // Position above the wrist

      // Draw text with outline for visibility
      this.ctx.strokeText("R", x, y);
      this.ctx.fillText("R", x, y);
    }
  }
}
