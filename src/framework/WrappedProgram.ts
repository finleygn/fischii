import { createProgram, createShader } from "@fishley/wwwgraphics/webgl";

abstract class WrappedProgram {
  public program: WebGLProgram;
  protected gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext, vert: string, frag: string) {
    this.program = createProgram(
      gl,
      createShader(gl, gl.VERTEX_SHADER, vert),
      createShader(gl, gl.FRAGMENT_SHADER, frag)
    );
    this.gl = gl;
  }

  public use() {
    this.gl.useProgram(this.program);
  }

  protected setupUniformLocation(program: WebGLProgram, name: string): WebGLUniformLocation {
    const u_location = this.gl.getUniformLocation(program, name);
    return u_location!;
  }

  protected setupAttributeLocation(program: WebGLProgram, name: string): number {
    return this.gl.getAttribLocation(program, name);
  }
}

export default WrappedProgram;