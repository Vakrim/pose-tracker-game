import { Game } from "./game";
import { HasWristsPosition } from "./Pose";
import zombieAssetSrc from "./assets/zombie.png";
import swordAssetSrc from "./assets/sword.png";

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

  private zombieAsset = new Image();
  private swordAsset = new Image();

  constructor(private gameWidth: number, private gameHeight: number) {
    this.unitSize = this.gameHeight / 5;

    this.zombieAsset.src = zombieAssetSrc;
    this.swordAsset.src = swordAssetSrc;
  }

  update(
    deltaTime: number,
    poses: HasWristsPosition[],
    ctx: CanvasRenderingContext2D,
  ): void {
    if (!this.target) {
      this.createTarget();
    }

    const swordSize = this.unitSize * 0.8;
    const swordAngle = -(1 * Math.PI) / 4;

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

        const leftWristAngle = pose.getLeftWristAngle() ?? 0;

        ctx.save();
        ctx.translate(leftWrist.x, leftWrist.y);
        ctx.rotate(leftWristAngle + swordAngle);
        ctx.drawImage(
          this.swordAsset,
          -swordSize / 2,
          -swordSize / 2,
          swordSize,
          swordSize,
        );
        ctx.restore();
      }

      if (rightWrist) {
        if (
          target.hand === "right" &&
          this.isTouchingTarget(rightWrist, this.unitSize)
        ) {
          isHitting = true;
        }

        const rightWristAngle = pose.getRightWristAngle() ?? 0;

        ctx.save();
        ctx.translate(rightWrist.x, rightWrist.y);
        ctx.rotate(rightWristAngle + swordAngle);
        ctx.drawImage(
          this.swordAsset,
          -swordSize / 2,
          -swordSize / 2,
          swordSize,
          swordSize,
        );
        ctx.restore();
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

    const zombieSize = radius * 1.2;

    ctx.drawImage(
      this.zombieAsset,
      centerX - zombieSize / 2,
      centerY - zombieSize / 2,
      zombieSize,
      zombieSize,
    );

    if (this.target.health > 0) {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius,
        -Math.PI / 2, // Start from top
        -Math.PI / 2 + (2 * Math.PI * this.target.health) / TARGET_MAX_HEALTH,
      );
      ctx.stroke();
    }
  }
}
