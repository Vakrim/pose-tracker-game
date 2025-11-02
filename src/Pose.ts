import * as poseDetection from "@tensorflow-models/pose-detection";
import { KEYPOINTS_INDEX } from "./poseDrawer";
import { Position } from "./Position";

export interface HasWristsPosition {
  getRightWrist(): Position | null;
  getLeftWrist(): Position | null;
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

    return { x: this.gameWidth - candidate.x, y: candidate.y };
  }

  public getLeftWrist(): poseDetection.Keypoint | null {
    const candidate = this.originalPose.keypoints[KEYPOINTS_INDEX.LEFT_WRIST];

    if (!candidate.score || candidate.score < 0.3) {
      return null;
    }

    return { x: this.gameWidth - candidate.x, y: candidate.y };
  }
}
