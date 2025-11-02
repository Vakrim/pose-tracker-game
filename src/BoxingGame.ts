import { Game } from "./game";
import { HasWristsPosition } from "./Pose";

export interface BoxingTarget {
  x: number;
  y: number;
  hand: "left" | "right";
  health: number;
}

const TARGET_MAX_HEALTH = 0.3;

export class BoxingGame implements Game {
  public isInitialized = false;
  private target: BoxingTarget | null = null;
  private unitSize: number;

  constructor(private gameWidth: number, private gameHeight: number) {
    this.unitSize = this.gameHeight / 5;
  }

  update(
    deltaTime: number,
    poses: HasWristsPosition[],
    ctx: CanvasRenderingContext2D,
  ): void {
    if (!this.target) {
      this.createTarget();
    }

    const target = this.target!;

    let isHitting = false;

    for (const pose of poses) {
      const leftWrist = pose.getLeftWrist();
      const rightWrist = pose.getRightWrist();

      if (leftWrist) {
        if (
          target.hand === "left" &&
          this.isTouchingTarget(leftWrist, this.unitSize)
        ) {
          isHitting = true;
        }

        ctx.fillStyle = "blue";
        ctx.fillRect(leftWrist.x - 10, leftWrist.y - 10, 20, 20);
      }

      if (rightWrist) {
        if (
          target.hand === "right" &&
          this.isTouchingTarget(rightWrist, this.unitSize)
        ) {
          isHitting = true;
        }

        ctx.fillStyle = "green";
        ctx.fillRect(rightWrist.x - 10, rightWrist.y - 10, 20, 20);
      }
    }

    if (isHitting) {
      target.health -= deltaTime;

      if (target.health <= 0) {
        this.target = null;
      }
    } else {
      target.health += deltaTime * 0.3;
      if (target.health > TARGET_MAX_HEALTH) {
        target.health = TARGET_MAX_HEALTH;
      }
    }
  }

  private createTarget(): void {
    const isOnLeft = Math.random() < 0.5;
    const verticalPosition = Math.floor(Math.random() * 4) + 1;

    this.target = {
      x: this.gameWidth / 2 + (isOnLeft ? -1 : 1) * this.unitSize * 2,
      y: verticalPosition * this.unitSize,
      hand: isOnLeft ? "right" : "left",
      health: TARGET_MAX_HEALTH,
    };
  }

  private isTouchingTarget(
    point: { x: number; y: number },
    unit: number,
  ): boolean {
    if (!this.target) {
      return false;
    }

    return (
      point.x >= this.target.x - unit / 2 &&
      point.x <= this.target.x + unit / 2 &&
      point.y >= this.target.y - unit / 2 &&
      point.y <= this.target.y + unit / 2
    );
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.target) {
      return;
    }

    const centerX = this.target.x;
    const centerY = this.target.y;
    const radius = this.unitSize / 2;

    // Draw background circle (full health)
    ctx.fillStyle = "rgba(100, 100, 100, 0.3)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Draw health pie chart (remaining health)
    if (this.target.health > 0) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.7)";
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        radius,
        -Math.PI / 2, // Start from top
        -Math.PI / 2 + (2 * Math.PI * this.target.health) / TARGET_MAX_HEALTH,
      );
      ctx.closePath();
      ctx.fill();
    }
  }
}
