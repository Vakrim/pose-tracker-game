import { HasWristsPosition } from "./Pose";

export interface Game {
  update: (
    deltaTime: number,
    poses: HasWristsPosition[],
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}
