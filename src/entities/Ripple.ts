import WrappedProgram from "../framework/WrappedProgram";
import shaderDefaultVertex from '../shaders/default.vert.glsl?raw';
import shaderRippleFragment from '../shaders/ripple.frag.glsl?raw';
import Mat2 from "../math/Mat2";
import { Vec2 } from "@fishley/wwwgraphics/math";
import { AnimatedValue, EaseType } from "@fishley/wwwgraphics/animation/engine";
import { QUAD_GEOMETRY } from "../geometry";
import { createGeometryBuffer } from "../framework/webgl";
import type GlobalContext from "../framework/GlobalContext";

class RippleProgram extends WrappedProgram {
  public u_matrix_location: WebGLUniformLocation;
  public u_progress_location: WebGLUniformLocation;

  public a_position_location: number;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, shaderDefaultVertex, shaderRippleFragment);

    this.u_matrix_location = this.setupUniformLocation(this.program, "u_matrix");
    this.u_progress_location = this.setupUniformLocation(this.program, "u_progress");

    this.a_position_location = this.setupAttributeLocation(this.program, "position");
  }

  public setUniformMatrix(matrix: Mat2) {
    this.gl.uniformMatrix3x2fv(
      this.u_matrix_location,
      false,
      matrix
    );
  }

  public setUniformProgress(progress: number) {
    this.gl.uniform1f(
      this.u_progress_location,
      progress
    );
  }
}

class Ripples {
  private context: GlobalContext;
  private program: RippleProgram;
  private instances: { position: Vec2, progress: number }[] = [];

  private geometryBuffer: WebGLBuffer;

  constructor(context: GlobalContext) {
    this.context = context;
    this.program = new RippleProgram(context.gl);
    this.geometryBuffer = createGeometryBuffer(context.gl, QUAD_GEOMETRY);
    this.setupMouseListener();
  }


  public createRipple(position: Vec2) {
    const ripple = { position, progress: 0 };

    const animatedObject = new AnimatedValue(
      (progress) => {
        ripple.progress = progress
      },
      {
        ease: EaseType.EASE_OUT,
        duration: 2,
        finish: () => {
          this.instances.shift()
        },
      },
    );

    this.instances.push(ripple);
    this.context.animationEngine.add(animatedObject.ani);
  }

  public draw() {
    const gl = this.context.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);

    gl.vertexAttribPointer(this.program.a_position_location, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.program.a_position_location);

    this.program.use();

    for (const ripple of this.instances) {
      const boxMatrix = Mat2.copy(new Mat2(), this.context.projection)
        .translate(ripple.position)
        .translate(new Vec2(-0.5, -0.5));

      this.program.setUniformMatrix(boxMatrix);
      this.program.setUniformProgress(ripple.progress);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
  }

  private setupMouseListener() {
    window.addEventListener("mousedown", (e) => {
      let position = new Vec2(
        e.clientX / window.innerWidth,
        e.clientY / window.innerHeight,
      )
      position.y = 1 - position.y

      position.subtract(new Vec2(0.5, 0.5));
      position.multiplyScalar(2);

      const aspect = window.innerWidth / window.innerHeight;
      position.x *= aspect;

      this.createRipple(position);
    })
  }
}

export default Ripples;