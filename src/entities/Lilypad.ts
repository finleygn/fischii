import WrappedProgram from "../framework/WrappedProgram";
import shaderDefaultVertex from '../shaders/default.vert.glsl?raw';
import shaderTextureFragment from '../shaders/texture.frag.glsl?raw';
import Mat2 from "../math/Mat2";
import { Vec2 } from "@fishley/wwwgraphics/math";
import { QUAD_GEOMETRY } from "../geometry";
import { createGeometryBuffer } from "../framework/webgl";
import type GlobalContext from "../framework/GlobalContext";

class LilypadProgram extends WrappedProgram {
  public u_matrix_location: WebGLUniformLocation;
  public u_texture_location: WebGLUniformLocation;

  public a_position_location: number;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, shaderDefaultVertex, shaderTextureFragment);

    this.u_matrix_location = this.setupUniformLocation(this.program, "u_matrix");
    this.u_texture_location = this.setupUniformLocation(this.program, "u_texture");
    this.a_position_location = this.setupAttributeLocation(this.program, "position");
  }

  public setUniformMatrix(matrix: Mat2) {
    this.gl.uniformMatrix3x2fv(
      this.u_matrix_location,
      false,
      matrix
    );
  }

  public setUniformTexture(texture: number) {
    this.gl.uniform1i(
      this.u_texture_location,
      texture
    );
  }
}

class Lilypad {
  private context: GlobalContext;
  private program: LilypadProgram;
  public position: Vec2 = new Vec2(0, 0);
  public scale: Vec2 = new Vec2(1, 1);
  public rotation: number = 0;

  private geometryBuffer: WebGLBuffer;

  constructor(context: GlobalContext) {
    this.context = context;
    this.program = new LilypadProgram(context.gl);
    this.geometryBuffer = createGeometryBuffer(context.gl, QUAD_GEOMETRY);
  }


  public draw() {
    const gl = this.context.gl;

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);

    gl.vertexAttribPointer(this.program.a_position_location, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.program.a_position_location);

    this.program.use();

    const boxMatrix = Mat2.copy(new Mat2(), this.context.projection)
      .translate(this.position)
      .scale(this.scale)
      .rotate(this.rotation)
      .translate(new Vec2(-0.5, -0.5));

    this.program.setUniformMatrix(boxMatrix);
    this.program.setUniformTexture(0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

export default Lilypad;