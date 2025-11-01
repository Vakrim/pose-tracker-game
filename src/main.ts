import { PoseDetector } from './poseDetector';
import { PoseDrawer } from './poseDrawer';

class App {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private poseDetector: PoseDetector;
  private poseDrawer: PoseDrawer;
  private loadingElement: HTMLElement;

  constructor() {
    this.video = document.getElementById('video') as HTMLVideoElement;
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.loadingElement = document.getElementById('loading') as HTMLElement;
    this.poseDetector = new PoseDetector();
    this.poseDrawer = new PoseDrawer(this.ctx);
    
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      this.video.srcObject = stream;
      
      // Wait for video to be ready
      this.video.addEventListener('loadedmetadata', () => {
        this.resizeCanvas();
        this.loadingElement.textContent = 'Initializing MoveNet...';
        this.initializePoseDetector();
      });

      // Handle window resize
      window.addEventListener('resize', () => this.resizeCanvas());

    } catch (error) {
      console.error('Error accessing webcam:', error);
      this.loadingElement.textContent = 'Error: Could not access webcam';
    }
  }

  private async initializePoseDetector(): Promise<void> {
    try {
      await this.poseDetector.initialize();
      this.loadingElement.style.display = 'none';
      this.detectPose();
    } catch (error) {
      console.error('Error initializing pose detector:', error);
      this.loadingElement.textContent = 'Error: Failed to load MoveNet model';
    }
  }

  private resizeCanvas(): void {
    // Set canvas internal dimensions to match video's actual dimensions
    // CSS will handle scaling to maintain aspect ratio
    this.canvas.width = this.video.videoWidth || 640;
    this.canvas.height = this.video.videoHeight || 480;
  }

  private detectPose = async (): Promise<void> => {
    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      // Ensure canvas matches video dimensions
      if (this.canvas.width !== this.video.videoWidth || 
          this.canvas.height !== this.video.videoHeight) {
        this.resizeCanvas();
      }

      // Clear canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Detect poses
      const poses = await this.poseDetector.detect(this.video);
      
      // Debug: Log detection results
      if (poses && poses.length > 0) {
        console.log(`Detected ${poses.length} pose(s)`);
        if (poses[0].keypoints) {
          console.log(`Keypoints: ${poses[0].keypoints.length}`, poses[0].keypoints.slice(0, 3));
        }
      } else {
        // Log every 60 frames to avoid spam
        if (Math.random() < 0.017) { // ~1/60 chance
          console.log('No poses detected');
        }
      }
      
      // Draw poses
      if (poses && poses.length > 0) {
        this.poseDrawer.drawPoses(poses, this.canvas.width, this.canvas.height);
      }
    }

    // Continue detection loop
    requestAnimationFrame(this.detectPose);
  };
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}

