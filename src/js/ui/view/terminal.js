import { FONT } from "../../util/font.js";
import { numberToColour, fancyAlpha } from "../../util/helpers.js";

import vertOpaque from "../../../shaders/opaque.glslv";
import fragOpaque from "../../../shaders/opaque.glslf";
import vertTransparent from "../../../shaders/transparent.glslv";
import fragTransparent from "../../../shaders/transparent.glslf";

const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 16;

export class Terminal {
  constructor(vnode) {
    const attrs = vnode.attrs || {};

    this.width = attrs.width || 80;
    this.height = attrs.height || 25;
    this.transparent = attrs.transparent || false;

    this.currentBG = [0, 0, 0];
    this.currentFG = [1, 1, 1];
    this.hasChanged = false;
  }

  loadFont() {
    this.fontLoaded = false;
    this.fontTexture = twgl.createTexture(this.gl, {
      src: "images/font.png",
      minMag: this.gl.NEAREST,
    }, () => this.fontLoaded = true);
  }

  createProgram() {
    if (this.transparent) {
      this.programInfo = twgl.createProgramInfo(this.gl, [vertTransparent, fragTransparent]);
    } else {
      this.programInfo = twgl.createProgramInfo(this.gl, [vertOpaque, fragOpaque]);
    }
  }

  createBuffers() {
    const numChars = this.width * this.height;

    this.buffers = {}
    this.buffers.pos = new Float32Array(numChars * 2); // x and y coordinates
    this.buffers.tex = new Float32Array(numChars * 2); // u and v texture coordinates

    if (this.transparent) {
      this.buffers.bg = new Float32Array(numChars * 4);  // background color of the cell
      this.buffers.fg = new Float32Array(numChars * 4);  // foreground color of the cell
    } else {
      this.buffers.bg = new Float32Array(numChars * 3);
      this.buffers.fg = new Float32Array(numChars * 3);
    }

    this.buffers.char = new Array(numChars);

    // now, we need a buffer with rectangle vertices, composed of two triangles
    // (0, 1) +--+ (1, 1)
    //        |\ |
    //        | \|
    // (0, 0) +--+ (1, 0)
    // first triangle:  (0, 1), (1, 0), (0, 0)
    // second triangle: (0, 1), (1, 1), (1, 0)
    const rectangle = [0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0];

    const numColors = this.transparent ? 4 : 3;

    this.bufferInfo = twgl.createBufferInfoFromArrays(this.gl, {
      inRectPos: { data: rectangle, numComponents: 2, divisor: 0 },
      inPos: { data: this.buffers.pos, numComponents: 2, divisor: 1, drawType: this.gl.DYNAMIC_DRAW },
      inTex: { data: this.buffers.tex, numComponents: 2, divisor: 1, drawType: this.gl.DYNAMIC_DRAW },
      inBG: { data: this.buffers.bg, numComponents: numColors, divisor: 1, drawType: this.gl.DYNAMIC_DRAW },
      inFG: { data: this.buffers.fg, numComponents: numColors, divisor: 1, drawType: this.gl.DYNAMIC_DRAW },
    });
  }

  setChar(x, y, char, bg, fg) {
    if (x < 1 || y < 1 || x > this.width || y > this.height)
      return;

    const codepoint = char.charCodeAt(0);
    const glyphIndex = FONT[codepoint] || FONT["?".charCodeAt(0)];
    // there are 128 16x16 glyphs in a row
    const glyphX = glyphIndex % 128;
    const glyphY = Math.floor(glyphIndex / 128);
    // normalize coordinates to [0; 1] range
    const glyphXNorm = glyphX / 128;
    const glyphYNorm = glyphY / 128;

    // normalize coordinates to [-1; 1] range
    const xNorm = (x - 1) / this.width * 2 - 1;
    const yNorm = (this.height - y) / this.height * 2 - 1;  // in WebGL, the y axsis goes up

    const idx = (y - 1) * this.width + x - 1;

    this.buffers.pos[idx * 2 + 0] = xNorm;
    this.buffers.pos[idx * 2 + 1] = yNorm;

    this.buffers.tex[idx * 2 + 0] = glyphXNorm;
    this.buffers.tex[idx * 2 + 1] = glyphYNorm;

    let [r, g, b] = bg;
    if (this.transparent) {
      let a = fancyAlpha(r, g, b);
      this.buffers.bg[idx * 4 + 0] = r;
      this.buffers.bg[idx * 4 + 1] = g;
      this.buffers.bg[idx * 4 + 2] = b;
      this.buffers.bg[idx * 4 + 3] = a;
    } else {
      this.buffers.bg[idx * 3 + 0] = r;
      this.buffers.bg[idx * 3 + 1] = g;
      this.buffers.bg[idx * 3 + 2] = b;
    }

    [r, g, b] = fg;
    if (this.transparent) {
      let a = fancyAlpha(r, g, b);
      this.buffers.fg[idx * 4 + 0] = r;
      this.buffers.fg[idx * 4 + 1] = g;
      this.buffers.fg[idx * 4 + 2] = b;
      this.buffers.fg[idx * 4 + 3] = a;
    } else {
      this.buffers.fg[idx * 3 + 0] = r;
      this.buffers.fg[idx * 3 + 1] = g;
      this.buffers.fg[idx * 3 + 2] = b;
    }

    this.buffers.char[idx] = char;
  }

  getChar(x, y) {
    const idx = (y - 1) * this.width + x - 1;
    const char = this.buffers.char[idx];

    let r, g, b, bg, fg;

    if (this.transparent) {
      r = this.buffers.bg[idx * 4 + 0];
      g = this.buffers.bg[idx * 4 + 1];
      b = this.buffers.bg[idx * 4 + 2];
    } else {
      r = this.buffers.bg[idx * 3 + 0];
      g = this.buffers.bg[idx * 3 + 1];
      b = this.buffers.bg[idx * 3 + 2];
    }

    bg = [r, g, b];

    if (this.transparent) {
      r = this.buffers.fg[idx * 4 + 0];
      g = this.buffers.fg[idx * 4 + 1];
      b = this.buffers.fg[idx * 4 + 2];
    } else {
      r = this.buffers.fg[idx * 3 + 0];
      g = this.buffers.fg[idx * 3 + 1];
      b = this.buffers.fg[idx * 3 + 2];
    }

    fg = [r, g, b];

    return [char, bg, fg];
  }

  set(x, y, str, vertical = false) {
    this.hasChanged = true;

    for (let i = 0; i < str.length; i++) {
      let char = str.charAt(i);

      if (vertical)
        this.setChar(x, y + i, char, this.currentBG, this.currentFG);
      else
        this.setChar(x + i, y, char, this.currentBG, this.currentFG);
    }
  }

  fill(x, y, width, height, value) {
    this.hasChanged = true;
    const char = value.charAt(0);

    for (let iy = y; iy < y + height; iy++)
      for (let ix = x; ix < x + width; ix++)
        this.setChar(ix, iy, char, this.currentBG, this.currentFG);
  }

  copy(x, y, width, height, xt, yt) {
    this.hasChanged = true;

    for (let iy = y; iy < y + height; iy++) {
      for (let ix = x; ix < x + width; ix++) {
        let char, bg, fg = getChar(ix, iy);
        this.setChar(ix + xt, iy + yt, char, bg, fg);
      }
    }
  }

  setBackground(bg) {
    const [r, g, b] = numberToColour(bg);
    this.currentBG = [r / 255, g / 255, b / 255];
  }

  setForeground(fg) {
    const [r, g, b] = numberToColour(fg);
    this.currentFG = [r / 255, g / 255, b / 255];
  }

  render() {
    if (this.shouldStop)
      return;

    if (!this.hasChanged || !this.fontLoaded) {
      window.requestAnimationFrame(() => this.render());
      return;
    }

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    const pixelWidth = this.width * CHAR_WIDTH;
    const pixelHeight = this.height * CHAR_HEIGHT;

    this.canvas.style.width = pixelWidth + "px";
    this.canvas.style.height = pixelHeight + "px";
    this.canvas.width = pixelWidth;
    this.canvas.height = pixelHeight;
    this.gl.viewport(0, 0, pixelWidth, pixelHeight);

    this.gl.useProgram(this.programInfo.program);

    twgl.setUniforms(this.programInfo, {
      uCharSize: [2.0 / this.width, 2.0 / this.height],
      uGlyphSize: [8 / 2048, 16 / 2048],
      uFont: this.fontTexture,
    });

    twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs.inPos, this.buffers.pos);
    twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs.inTex, this.buffers.tex);
    twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs.inBG, this.buffers.bg);
    twgl.setAttribInfoBufferFromArray(this.gl, this.bufferInfo.attribs.inFG, this.buffers.fg);

    twgl.setBuffersAndAttributes(this.gl, this.programInfo, this.bufferInfo);
    twgl.drawBufferInfo(this.gl, this.bufferInfo, this.gl.TRIANGLES, 6, 0, this.width * this.height);

    this.gl.flush();

    this.hasChanged = false;

    window.requestAnimationFrame(() => this.render());
  }

  oncreate(vnode) {
    this.canvas = vnode.dom;
    this.gl = this.canvas.getContext("webgl");
    twgl.addExtensionsToContext(this.gl);

    if (!this.gl) {
      alert("Your browser does not support WebGL, bye bye!");
      return;
    }

    this.loadFont();
    this.createProgram();
    this.createBuffers();

    this.setBackground(0x000000);
    this.fill(1, 1, this.width, this.height, " ");
    this.set(1, 1, "привет");
    this.set(1, 2, "я куда-то нажал, и всё исчезло");
    this.setForeground(0xFFAAAA);
    this.set(1, 3, "не подскажешь, как всё вернуть?");
    this.hasChanged = true;

    window.requestAnimationFrame(() => this.render());
  }

  onremove() {
    this.shouldStop = true;
  }

  view() {
    return m("canvas.terminal-canvas");
  }
}
