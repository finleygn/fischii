import { lerp } from "@fishley/wwwgraphics/animation";
import { Vec2 } from "@fishley/wwwgraphics/math";
import type GlobalContext from "../framework/GlobalContext";
import WrappedProgram from "../framework/WrappedProgram";
import Mat2 from "../math/Mat2";
import shaderDefaultFragment from "../shaders/default.frag.glsl?raw";
import shaderDefaultVertex from "../shaders/default.vert.glsl?raw";

abstract class FishSegment {
    static MAX_DISTANCE = 0.08;
    public direction: Vec2 = new Vec2(1, 0);
    public position: Vec2 = new Vec2(0, 0);
    public size: number = 0.2;

    abstract update(dt: number): void;
}

const enum FishMovementState {
    Swimming,
    Turning,
}

class FishSegmentHead extends FishSegment {
    private speed: number = 0.3;
    private state: FishMovementState = FishMovementState.Swimming;

    private rotation = 0;

    // Strongest turning circle
    private maxRotationSpeed = 1;
    // Weakest turning circle
    private minRotationSpeed = 0.5;

    private flipFlopRotationSpeed = 1;

    // When swimming alternate between left and right motions over and over.
    private remainingSwimmingTime = 0;
    private remainingFlipFlopTime = 0;

    // Maximum time to complete a rotation
    private remainingRotationTime = 0;

    constructor(size: number) {
        super();
        this.size = size;
    }

    private beginSwimming() {
        this.state = FishMovementState.Swimming;
        this.remainingSwimmingTime = 1 + Math.random() * 3;
        this.flipFlop();
    }

    private flipFlop() {
        this.remainingFlipFlopTime = 1;
        if (this.rotation > 0) {
            this.rotation = -this.flipFlopRotationSpeed;
        } else {
            this.rotation = this.flipFlopRotationSpeed;
        }
    }

    private beginRotate() {
        this.state = FishMovementState.Turning;
        this.remainingRotationTime = 1 + Math.random() * 3;
        this.rotation =
            lerp(this.minRotationSpeed, this.maxRotationSpeed, Math.random()) *
            (Math.random() > 0.5 ? 1 : -1);
    }

    private beginRotateToCenter() {
        this.state = FishMovementState.Turning;

        const toCenter = new Vec2(
            -this.position.x,
            -this.position.y,
        ).normalize();
        const crossProduct = this.direction.cross(toCenter);
        this.rotation = (crossProduct > 0 ? 1 : -1) * this.maxRotationSpeed;

        const dotProduct =
            this.direction.x * toCenter.x + this.direction.y * toCenter.y;
        const clampedDot = Math.max(-1, Math.min(1, dotProduct));
        const angleInRadians = Math.acos(clampedDot);

        this.remainingRotationTime = angleInRadians / this.maxRotationSpeed;
    }

    update(dt: number) {
        if (this.state === FishMovementState.Turning) {
            this.remainingRotationTime -= dt;

            if (this.remainingRotationTime <= 0) {
                this.beginSwimming();
            }
        }

        if (this.state === FishMovementState.Swimming) {
            this.remainingFlipFlopTime -= dt;
            this.remainingSwimmingTime -= dt;

            if (this.remainingFlipFlopTime <= 0) {
                this.flipFlop();
            }

            if (this.position.magnitude() > 2) {
                this.beginRotateToCenter();
            } else if (this.remainingSwimmingTime <= 0) {
                this.beginRotate(); // Standard random wandering
            }
        }

        this.direction.rotate(this.rotation * dt);
        const next_position = this.position
            .clone()
            .add(this.direction.clone().multiplyScalar(this.speed * dt));

        this.position.x = next_position.x;
        this.position.y = next_position.y;
    }
}

class FishSegmentBody extends FishSegment {
    private following: FishSegment;

    constructor(following: FishSegment, size: number) {
        super();
        this.following = following;
        this.size = size;
    }

    update() {
        if (
            this.following.position.distance(this.position) >=
            FishSegment.MAX_DISTANCE
        ) {
            const offset = this.position
                .clone()
                .subtract(this.following.position)
                .normalize()
                .multiplyScalar(FishSegment.MAX_DISTANCE);

            const new_position = this.following.position.clone().add(offset);

            this.position.x = new_position.x;
            this.position.y = new_position.y;
        }

        if (this.position.distance(this.following.position) > 0.00001) {
            this.direction = this.position
                .direction(this.following.position)
                .multiplyScalar(-1);
        }
    }
}

class FishProgram extends WrappedProgram {
    public u_matrix_location: WebGLUniformLocation;
    public u_colour_location: WebGLUniformLocation;
    public a_position_location: number;

    constructor(gl: WebGL2RenderingContext) {
        super(gl, shaderDefaultVertex, shaderDefaultFragment);

        this.u_matrix_location = this.setupUniformLocation(
            this.program,
            "u_matrix",
        );
        this.u_colour_location = this.setupUniformLocation(
            this.program,
            "u_colour",
        );
        this.a_position_location = this.setupAttributeLocation(
            this.program,
            "position",
        );
    }

    public setUniformMatrix(matrix: Mat2) {
        this.gl.uniformMatrix3x2fv(this.u_matrix_location, false, matrix);
    }

    public setUniformColour(colour: [number, number, number, number]) {
        this.gl.uniform4fv(this.u_colour_location, colour);
    }
}

class Fish {
    private segments: [FishSegmentHead, ...FishSegmentBody[]];
    private program: FishProgram;
    private context: GlobalContext;
    private geometryBuffer: WebGLBuffer;
    public depth: number;

    constructor(context: GlobalContext) {
        this.context = context;
        this.program = new FishProgram(context.gl);
        // This will need to be constructed on the fly in the future, just render quads for movement logic for now.
        this.geometryBuffer = context.gl.createBuffer();

        const head = new FishSegmentHead(0.01);
        const segments: [FishSegmentHead, ...FishSegmentBody[]] = [head];

        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.04));
        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.06));
        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.05));
        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.03));
        segments.push(
            new FishSegmentBody(segments[segments.length - 1], 0.005),
        );
        segments.push(new FishSegmentBody(segments[segments.length - 1], 0.04));
        this.depth = lerp(0.3, 0.8, Math.random());

        this.segments = segments;
    }

    static randomFish(context: GlobalContext) {
        const fish = new Fish(context);
        const head = fish.segments[0];
        head.position.x = (Math.random() * 2 - 1) * 2;
        head.position.y = (Math.random() * 2 - 1) * 2;
        const normalizedPosition = head.position.clone().normalize();
        head.direction.x = normalizedPosition.x;
        head.direction.y = normalizedPosition.y;

        for (let i = 0; i <= 10; i++) {
            fish.update(1);
        }

        return fish;
    }

    update(dt: number) {
        const gl = this.context.gl;

        let geometry = [];

        for (const segment of this.segments.slice(0)) {
            segment.update(dt);

            const vert_left = new Vec2(
                -segment.direction.y,
                segment.direction.x,
            ).multiplyScalar(segment.size);
            const vert_right = new Vec2(
                segment.direction.y,
                -segment.direction.x,
            ).multiplyScalar(segment.size);

            geometry.push(
                segment.position.x + vert_left.x,
                segment.position.y + vert_left.y,
                segment.position.x + vert_right.x,
                segment.position.y + vert_right.y,
            );
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, this.geometryBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(geometry),
            gl.STREAM_DRAW,
        );
    }

    draw() {
        const gl = this.context.gl;

        this.program.use();
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

        this.program.setUniformMatrix(this.context.projection);
        this.program.setUniformColour([
            this.depth,
            this.depth,
            this.depth,
            1.0,
        ]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.segments.length * 2);
    }
}

export default Fish;
