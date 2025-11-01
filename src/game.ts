import { Pose } from "@tensorflow-models/pose-detection";
import { getLeftWrist, getRightWrist } from "./poseDrawer";

export interface Game {
  isInitialized: boolean;
  initialize: () => void;
  update: (
    deltaTime: number,
    poses: Pose[],
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => void;
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void;
}

export class BoxingGame implements Game {
  public isInitialized = false;
  private targetPosition: { x: number; y: number } | null = null;

  initialize(): void {
    this.isInitialized = true;
  }

  update(
    deltaTime: number,
    poses: Pose[],
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ): void {
    const unit = canvas.height / 5;

    console.log(this.targetPosition);

    if (!this.targetPosition) {
      this.createTarget(canvas);
    }

    for (const pose of poses) {
      const leftWrist = getLeftWrist(canvas.width, pose);
      const rightWrist = getRightWrist(canvas.width, pose);

      if (leftWrist) {
        if (this.isTouchingTarget(leftWrist, unit)) {
          console.log("left wrist touching target");
          this.targetPosition = null;
        }

        ctx.fillStyle = "blue";
        ctx.fillRect(leftWrist.x - 10, leftWrist.y - 10, 20, 20);
      }

      if (rightWrist) {
        if (this.isTouchingTarget(rightWrist, unit)) {
          console.log("right wrist touching target");
          this.targetPosition = null;
        }

        ctx.fillStyle = "green";
        ctx.fillRect(rightWrist.x - 10, rightWrist.y - 10, 20, 20);
      }
    }
  }

  private createTarget(canvas: HTMLCanvasElement): void {
    const unit = canvas.height / 5;

    const isOnLeft = Math.random() < 0.5;
    const verticalPosition = Math.random() * 3 + 1;

    this.targetPosition = {
      x: isOnLeft ? unit * 2 : canvas.width - unit * 2,
      y: verticalPosition * unit,
    };
  }

  private isTouchingTarget(
    point: { x: number; y: number },
    unit: number,
  ): boolean {
    if (!this.targetPosition) {
      return false;
    }

    return (
      point.x >= this.targetPosition.x - unit / 2 &&
      point.x <= this.targetPosition.x + unit / 2 &&
      point.y >= this.targetPosition.y - unit / 2 &&
      point.y <= this.targetPosition.y + unit / 2
    );
  }

  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const unit = canvas.height / 5;

    if (this.targetPosition) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        this.targetPosition.x - unit / 2,
        this.targetPosition.y - unit / 2,
        unit,
        unit,
      );
    }
  }
}
