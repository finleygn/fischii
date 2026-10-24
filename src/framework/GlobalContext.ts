import { AnimationEngine } from "@fishley/wwwgraphics/animation/engine"
import Mat2 from "../math/Mat2";

class GlobalContext {
  public gl: WebGL2RenderingContext;
  public animationEngine: AnimationEngine = new AnimationEngine();
  public projection: Mat2 = new Mat2();
  public canvas: HTMLCanvasElement

  constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
    this.gl = gl;
    this.canvas = canvas;
    this.update(0);
  }

  public update(dt: number) {
    this.setProjectionMatrix(this.canvas.clientWidth, this.canvas.clientHeight);
    this.animationEngine.tick(dt);
  }

  private setProjectionMatrix(width: number, height: number) {
    Mat2.orthographic(
      this.projection,
      width,
      height
    );
  }
}

export default GlobalContext;