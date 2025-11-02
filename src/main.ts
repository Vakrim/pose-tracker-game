import { Game } from "./game";
import { BoxingGame } from "./BoxingGame";
import { Pose } from "./Pose";
import { PoseDetector } from "./poseDetector";
import { PoseDrawer } from "./poseDrawer";

class App {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private poseDetector: PoseDetector;
  private poseDrawer: PoseDrawer;
  private loadingElement: HTMLElement;
  private game: Game | null;
  private lastTime: number = performance.now();

  constructor() {
    this.video = document.getElementById("video") as HTMLVideoElement;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.loadingElement = document.getElementById("loading") as HTMLElement;
    this.poseDetector = new PoseDetector();
    this.poseDrawer = new PoseDrawer(this.ctx);
    this.game = null;

    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      this.video.srcObject = stream;

      // Wait for video to be ready
      this.video.addEventListener("loadedmetadata", () => {
        this.resizeCanvas();
        this.loadingElement.textContent = "Initializing MoveNet...";
        this.initializePoseDetector();
      });

      // Handle window resize
      window.addEventListener("resize", () => this.resizeCanvas());
    } catch (error) {
      console.error("Error accessing webcam:", error);
      this.loadingElement.textContent = "Error: Could not access webcam";
    }
  }

  private async initializePoseDetector(): Promise<void> {
    try {
      await this.poseDetector.initialize();
      this.loadingElement.style.display = "none";
      this.gameloop();
    } catch (error) {
      console.error("Error initializing pose detector:", error);
      this.loadingElement.textContent = "Error: Failed to load MoveNet model";
    }
  }

  private resizeCanvas(): void {
    // Set canvas internal dimensions to match video's actual dimensions
    // CSS will handle scaling to maintain aspect ratio
    this.canvas.width = this.video.videoWidth || 640;
    this.canvas.height = this.video.videoHeight || 480;
  }

  private gameloop = async (): Promise<void> => {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      // Ensure canvas matches video dimensions
      if (
        this.canvas.width !== this.video.videoWidth ||
        this.canvas.height !== this.video.videoHeight
      ) {
        this.resizeCanvas();
        this.game = null;
      }

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.strokeStyle = "white";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);

      // Detect poses
      const poses = await this.poseDetector.detect(this.video);

      if (!this.game) {
        this.game = new BoxingGame(this.canvas.width, this.canvas.height);
      }

      if (poses && poses.length > 0) {
        this.game.update(
          (performance.now() - this.lastTime) / 1000,
          poses.map((pose) => new Pose(pose, this.canvas.width)),
          this.ctx,
          this.canvas,
        );
      }

      this.game.draw(this.ctx);

      this.lastTime = performance.now();

      if (poses && poses.length > 0) {
        this.poseDrawer.drawPoses(poses, this.canvas.width, this.canvas.height);
      }
    }

    // Continue detection loop
    requestAnimationFrame(this.gameloop);
  };
}

// Start the app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new App());
} else {
  new App();
}
