import type GlobalContext from "../framework/GlobalContext";
import { createGeometryBuffer } from "../framework/webgl";
import WrappedProgram from "../framework/WrappedProgram";
import { TRI_FULLSCREEN_GEOMETRY, TRI_FULLSCREEN_UV } from "../geometry";
import shaderWavesFragment from "../shaders/waves.frag.glsl?raw";
import shaderFullscreenVertex from "../shaders/fullscreen.vert.glsl?raw";

class WavesProgram extends WrappedProgram {
    public a_position_location: number;
    public a_uv_location: number;
    public u_time_location: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext) {
        super(gl, shaderFullscreenVertex, shaderWavesFragment);
        this.a_position_location = this.setupAttributeLocation(
            this.program,
            "position",
        );
        this.a_uv_location = this.setupAttributeLocation(this.program, "uv");

        this.u_time_location = this.setupUniformLocation(
            this.program,
            "u_time",
        );
    }

    public setUniformTime(time: number) {
        this.gl.uniform1f(this.u_time_location, time);
    }

    public setupAttributePosition(geometryBuffer: WebGLBuffer) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, geometryBuffer);
        this.gl.vertexAttribPointer(
            this.a_position_location,
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );
        this.gl.enableVertexAttribArray(this.a_position_location);
    }
    public setupAttributeUv(uvBuffer: WebGLBuffer) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, uvBuffer);
        this.gl.vertexAttribPointer(
            this.a_uv_location,
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );
        this.gl.enableVertexAttribArray(this.a_uv_location);
    }
}

class Waves {
    private context: GlobalContext;
    private program: WavesProgram;

    private geometryBuffer: WebGLBuffer;
    private uvBuffer: WebGLBuffer;

    constructor(context: GlobalContext) {
        this.context = context;
        this.program = new WavesProgram(context.gl);
        this.geometryBuffer = createGeometryBuffer(
            context.gl,
            TRI_FULLSCREEN_GEOMETRY,
        );
        this.uvBuffer = createGeometryBuffer(context.gl, TRI_FULLSCREEN_UV);
    }

    public draw(time: number) {
        const gl = this.context.gl;

        this.program.use();

        this.program.setupAttributePosition(this.geometryBuffer);
        this.program.setupAttributeUv(this.uvBuffer);
        this.program.setUniformTime(time);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

export default Waves;
