import * as poseDetection from "@tensorflow-models/pose-detection";
import { KEYPOINTS_INDEX } from "./poseDrawer";
import { Position } from "./Position";

export interface HasWristsPosition {
  getRightWrist(): Position | null;
  getLeftWrist(): Position | null;
  getRightWristAngle(): number | null;
  getLeftWristAngle(): number | null;
}

export class Pose {
  constructor(
    private originalPose: poseDetection.Pose,
    private gameWidth: number,
  ) {}

  public getRightWrist(): poseDetection.Keypoint | null {
    const candidate = this.originalPose.keypoints[KEYPOINTS_INDEX.RIGHT_WRIST];

    if (!candidate.score || candidate.score < 0.3) {
      return null;
    }

    return this.keyPointToPosition(candidate);
  }

  public getLeftWrist(): poseDetection.Keypoint | null {
    const candidate = this.originalPose.keypoints[KEYPOINTS_INDEX.LEFT_WRIST];

    if (!candidate.score || candidate.score < 0.3) {
      return null;
    }

    return this.keyPointToPosition(candidate);
  }

  public getRightWristAngle(): number | null {
    const rightWrist = this.getRightWrist();
    if (!rightWrist) {
      return null;
    }

    return this.calculateAngle(
      rightWrist,
      this.keyPointToPosition(
        this.originalPose.keypoints[KEYPOINTS_INDEX.RIGHT_ELBOW],
      ),
    );
  }

  public getLeftWristAngle(): number | null {
    const leftWrist = this.getLeftWrist();
    if (!leftWrist) {
      return null;
    }

    return this.calculateAngle(
      leftWrist,
      this.keyPointToPosition(
        this.originalPose.keypoints[KEYPOINTS_INDEX.LEFT_ELBOW],
      ),
    );
  }

  private keyPointToPosition(keyPoint: poseDetection.Keypoint): Position {
    return { x: this.gameWidth - keyPoint.x, y: keyPoint.y };
  }

  private calculateAngle(start: Position, end: Position): number {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    return Math.atan2(dy, dx);
  }
}
