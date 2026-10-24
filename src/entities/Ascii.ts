import WrappedProgram from "../framework/WrappedProgram";
import shaderFullscreenVertex from "../shaders/fullscreen.vert.glsl?raw";
import shaderAsciiFragment from "../shaders/ascii.frag.glsl?raw";
import type GlobalContext from "../framework/GlobalContext";
import { createGeometryBuffer } from "../framework/webgl";
import { TRI_FULLSCREEN_GEOMETRY, TRI_FULLSCREEN_UV } from "../geometry";

class AsciiProgram extends WrappedProgram {
    public a_position_location: number;
    public a_uv_location: number;
    public u_character_texture_location: WebGLUniformLocation;
    public u_mask_texture_location: WebGLUniformLocation;
    public u_resolution_location: WebGLUniformLocation;
    public u_char_aspect_location: WebGLUniformLocation;

    constructor(gl: WebGL2RenderingContext) {
        super(gl, shaderFullscreenVertex, shaderAsciiFragment);

        this.a_position_location = this.setupAttributeLocation(
            this.program,
            "position",
        );
        this.a_uv_location = this.setupAttributeLocation(this.program, "uv");

        this.u_character_texture_location = this.setupUniformLocation(
            this.program,
            "u_character_texture",
        );
        this.u_mask_texture_location = this.setupUniformLocation(
            this.program,
            "u_mask_texture",
        );
        this.u_resolution_location = this.setupUniformLocation(
            this.program,
            "u_resolution",
        );
        this.u_char_aspect_location = this.setupUniformLocation(
            this.program,
            "u_char_aspect",
        );
    }

    public setUniformCharacterTexture(texture: number) {
        this.gl.uniform1i(this.u_character_texture_location, texture);
    }

    public setUniformMaskTexture(texture: number) {
        this.gl.uniform1i(this.u_mask_texture_location, texture);
    }

    public setUniformResolution(width: number, height: number) {
        this.gl.uniform2f(this.u_resolution_location, width, height);
    }

    public setUniformCharAspect(aspect: number) {
        this.gl.uniform1f(this.u_char_aspect_location, aspect);
    }
}

class Ascii {
    private context: GlobalContext;
    private program: AsciiProgram;

    private geometryBuffer: WebGLBuffer;
    private uvBuffer: WebGLBuffer;

    constructor(context: GlobalContext) {
        this.context = context;
        this.program = new AsciiProgram(context.gl);
        this.geometryBuffer = createGeometryBuffer(
            context.gl,
            TRI_FULLSCREEN_GEOMETRY,
        );
        this.uvBuffer = createGeometryBuffer(context.gl, TRI_FULLSCREEN_UV);
    }

    public draw() {
        const gl = this.context.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
        gl.vertexAttribPointer(
            this.program.a_position_location,
            2,
            gl.FLOAT,
            false,
            0,
            0,
        );
        gl.enableVertexAttribArray(this.program.a_position_location);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
        gl.vertexAttribPointer(
            this.program.a_uv_location,
            2,
            gl.FLOAT,
            false,
            0,
            0,
        );
        gl.enableVertexAttribArray(this.program.a_uv_location);

        this.program.use();

        this.program.setUniformCharAspect(1);
        this.program.setUniformResolution(
            this.context.canvas.clientWidth,
            this.context.canvas.clientHeight,
        );

        this.program.setUniformMaskTexture(0);
        this.program.setUniformCharacterTexture(1);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
}

export default Ascii;
