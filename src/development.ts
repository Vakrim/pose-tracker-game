import { DevelopmentPose } from "./developmentPose";
import { Game } from "./game";
import { BoxingGame } from "./BoxingGame";

class DevelopmentApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: Game | null;
  private lastTime: number = performance.now();
  private developmentPose: DevelopmentPose;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.game = null;
    this.developmentPose = new DevelopmentPose(this.canvas);

    this.init();
  }

  private async init(): Promise<void> {
    this.resizeCanvas();

    this.gameLoop();
  }

  private resizeCanvas(): void {
    // Set canvas internal dimensions to match video's actual dimensions
    // CSS will handle scaling to maintain aspect ratio
    this.canvas.width = 640;
    this.canvas.height = 480;
  }

  private gameLoop = async (): Promise<void> => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.game) {
      this.game = new BoxingGame(this.canvas.width, this.canvas.height);
    }

    this.game.update(
      (performance.now() - this.lastTime) / 1000,
      [this.developmentPose],
      this.ctx,
      this.canvas,
    );

    this.game.draw(this.ctx);

    this.lastTime = performance.now();

    // Continue detection loop
    requestAnimationFrame(this.gameLoop);
  };
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new DevelopmentApp());
} else {
  new DevelopmentApp();
}
