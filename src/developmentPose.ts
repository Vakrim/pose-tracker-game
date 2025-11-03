import { HasWristsPosition } from "./Pose";
import { Position } from "./Position";

export class DevelopmentPose implements HasWristsPosition {
  private leftWristPosition: Position | null = null;
  private rightWristPosition: Position | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.canvas.style.pointerEvents = "auto";
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener(
      "contextmenu",
      this.handleRightClick.bind(this),
    );
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      // Left mouse button
      const position = this.getMousePosition(event);
      this.leftWristPosition = position;
    }
  }

  private handleRightClick(event: MouseEvent): void {
    event.preventDefault(); // Prevent context menu
    const position = this.getMousePosition(event);
    this.rightWristPosition = position;
  }

  private getMousePosition(event: MouseEvent): Position {
    const rect = this.canvas.getBoundingClientRect();

    // Get mouse position relative to canvas
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Account for object-fit: contain - the content maintains aspect ratio
    // We need to calculate the actual content area within the canvas
    const canvasDisplayWidth = rect.width;
    const canvasDisplayHeight = rect.height;
    const canvasAspectRatio = this.canvas.width / this.canvas.height;
    const displayAspectRatio = canvasDisplayWidth / canvasDisplayHeight;

    let contentWidth: number;
    let contentHeight: number;
    let offsetX: number = 0;
    let offsetY: number = 0;

    if (canvasAspectRatio > displayAspectRatio) {
      // Canvas is wider than display area - fit by width
      contentWidth = canvasDisplayWidth;
      contentHeight = canvasDisplayWidth / canvasAspectRatio;
      offsetY = (canvasDisplayHeight - contentHeight) / 2;
    } else {
      // Canvas is taller than display area - fit by height
      contentHeight = canvasDisplayHeight;
      contentWidth = canvasDisplayHeight * canvasAspectRatio;
      offsetX = (canvasDisplayWidth - contentWidth) / 2;
    }

    // Convert mouse position to content coordinates
    const contentX = x - offsetX;
    const contentY = y - offsetY;

    // Scale to canvas dimensions and mirror X coordinate (due to scaleX(-1))
    const normalizedX = (contentX / contentWidth) * this.canvas.width;
    const normalizedY = (contentY / contentHeight) * this.canvas.height;

    return {
      x: normalizedX,
      y: normalizedY,
    };
  }

  public getLeftWrist(): Position | null {
    return this.leftWristPosition;
  }

  public getRightWrist(): Position | null {
    return this.rightWristPosition;
  }

  public getLeftWristAngle(): number | null {
    return Math.PI / 2;
  }

  public getRightWristAngle(): number | null {
    return Math.PI / 2;
  }
}
