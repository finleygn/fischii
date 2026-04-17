import './style.css';
import { appCanvas } from './element';
import { renderLoop } from '@fishley/wwwgraphics/app';
import asciiCharset from "./assets/ascii.png";
import Ripples from './entities/Ripple';
import GlobalContext from './framework/GlobalContext';
import { createWebGLInstance, loadTexture } from './framework/webgl';
import Ascii from './entities/Ascii';


const gl = createWebGLInstance(appCanvas);

const texture_charset = loadTexture(gl, asciiCharset);

const globalContext = new GlobalContext(gl, appCanvas);
const ripples = new Ripples(globalContext)

const ascii = new Ascii(globalContext);

const maskFrameBuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, maskFrameBuffer);

const texture_mask = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture_mask);

// TODO, set to auto regen on resize
const targetTextureWidth = appCanvas.width;
const targetTextureHeight = appCanvas.height;

gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, targetTextureWidth, targetTextureHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

const attachmentPoint = gl.COLOR_ATTACHMENT0;
gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture_mask, 0);


renderLoop(
  (frame) => {
    globalContext.update(frame.dt);

    // Resolution updates
    // const resolutionMultiple = Math.max(
    //   appCanvas.clientWidth / CHAR_SIZE,
    //   appCanvas.clientHeight / CHAR_SIZE
    // ) / Math.max(appCanvas.clientWidth, appCanvas.clientHeight);
    const width = appCanvas.clientWidth;
    const height = appCanvas.clientHeight;
    gl.canvas.width = width;
    gl.canvas.height = height;

    // Draw elements


    // Draw mask

    gl.bindFramebuffer(gl.FRAMEBUFFER, maskFrameBuffer);

    gl.viewport(0, 0, targetTextureWidth, targetTextureHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    ripples.draw();


    // ASCII pass
    gl.viewport(0, 0, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture_mask);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture_charset);

    gl.clear(gl.COLOR_BUFFER_BIT);
    ascii.draw();

  },
  { longestFrame: 1000 / 60 }
)
