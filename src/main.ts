import { AutonomousSmoothValue } from "@fishley/wwwgraphics/animation";
import { renderLoop } from "@fishley/wwwgraphics/app";
import { MousePositionTracker } from "@fishley/wwwgraphics/interaction";
import { Vec2 } from "@fishley/wwwgraphics/math";
import imageAsciiCharset from "./assets/ascii.png";
import imageLilypad from "./assets/lilypad.png";
import { appCanvas } from "./element";
import Ascii from "./entities/Ascii";
import Fish from "./entities/Fish";
import Lilypad from "./entities/Lilypad";
import Ripples from "./entities/Ripple";
import GlobalContext from "./framework/GlobalContext";
import { createWebGLInstance, loadTexture } from "./framework/webgl";
import "./style.css";
import Waves from "./entities/Waves";

const gl = createWebGLInstance(appCanvas);

const texture_charset = loadTexture(gl, imageAsciiCharset);
const texture_lilypad = loadTexture(gl, imageLilypad);

const globalContext = new GlobalContext(gl, appCanvas);
const ripples = new Ripples(globalContext);

const lilypad1 = new Lilypad(globalContext);
lilypad1.position.x = -1;
lilypad1.position.y = -0.5;
lilypad1.rotation = -2.2;
lilypad1.scale.x = 1.2;
lilypad1.scale.y = 1.2;

const lilypad2 = new Lilypad(globalContext);
lilypad2.position.x = 0.8;
lilypad2.position.y = 0.5;
lilypad2.rotation = -4;
lilypad2.scale.x = 0.6;
lilypad2.scale.y = 0.6;

const waves = new Waves(globalContext);

const fish = [
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
].sort((a, b) => a.depth - b.depth);
const ascii = new Ascii(globalContext);

//

const maskFrameBuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, maskFrameBuffer);

const texture_mask = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture_mask);

// TODO, set to auto regen on resize
const targetTextureWidth = appCanvas.width;
const targetTextureHeight = appCanvas.height;

gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    targetTextureWidth,
    targetTextureHeight,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const attachmentPoint = gl.COLOR_ATTACHMENT0;
gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    attachmentPoint,
    gl.TEXTURE_2D,
    texture_mask,
    0,
);

//

let renderMask = false;
window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        renderMask = !renderMask;
    }
});

const initialPosition = { x: 0.5, y: 0.5 };

const cursorTrailPosition = {
    x: new AutonomousSmoothValue(initialPosition.x),
    y: new AutonomousSmoothValue(initialPosition.y),
};

const tracker = new MousePositionTracker(
    initialPosition.x,
    initialPosition.y,
    document.body,
);

renderLoop(
    (frame) => {
        globalContext.update(frame.dt);

        cursorTrailPosition.x.target = tracker.x;
        cursorTrailPosition.y.target = tracker.y;

        // Slowly approach the mouse position
        cursorTrailPosition.x.tick(frame.dt);
        cursorTrailPosition.y.tick(frame.dt);

        // globalContext.projection.translate(
        //     new Vec2(
        //         cursorTrailPosition.x.value * 0.1,
        //         -cursorTrailPosition.y.value * 0.1,
        //     ),
        // );

        // Resolution updates
        // const resolutionMultiple = Math.max(
        //   appCanvas.clientWidth / CHAR_SIZE,
        //   appCanvas.clientHeight / CHAR_SIZE
        // ) / Math.max(appCanvas.clientWidth, appCanvas.clientHeight);
        const width = appCanvas.clientWidth;
        const height = appCanvas.clientHeight;
        gl.canvas.width = width * window.devicePixelRatio;
        gl.canvas.height = height * window.devicePixelRatio;

        // Draw elements

        // Draw mask

        for (const f of fish) {
            f.update(frame.dt);
        }

        if (renderMask) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.viewport(0, 0, width, height);
            gl.clear(gl.COLOR_BUFFER_BIT);

            for (const f of fish) {
                f.draw();
            }

            ripples.draw();

            waves.draw(frame.elapsed);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture_lilypad);
            lilypad1.draw();
        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, maskFrameBuffer);

            gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
            gl.clear(gl.COLOR_BUFFER_BIT);

            for (const f of fish) {
                f.draw();
            }

            ripples.draw();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture_lilypad);
            lilypad1.draw();
            lilypad2.draw();

            waves.draw(frame.elapsed);

            // ASCII pass
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture_mask);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, texture_charset);

            gl.clear(gl.COLOR_BUFFER_BIT);
            ascii.draw();
        }
    },
    { longestFrame: 1000 / 60 },
);
