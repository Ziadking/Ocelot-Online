// constants
// --------------------------------------------------------------------------------- //

// the size of one (single-width) character in pixels
const CHAR_WIDTH = 8;
const CHAR_HEIGHT = 16;

// terminal size in symbols
var WIDTH = 80;
var HEIGHT = 25;

// terminal size in pixels
var WIDTH_PX = WIDTH * CHAR_WIDTH;
var HEIGHT_PX = HEIGHT * CHAR_HEIGHT;

// variables
// --------------------------------------------------------------------------------- //
// current colors
var foreR = 1, foreG = 1, foreB = 1, foreA = 1;
var backR = 0, backG = 0, backB = 0, backA = 0.8;

// matrix of chars
var matrix = new Uint16Array(WIDTH * HEIGHT);

// webgl
// --------------------------------------------------------------------------------- //
var gl = terminal.getContext('webgl');
if (!gl) {
  alert("Your browser does not support WebGL!");
}

twgl.setAttributePrefix("a_");

const programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

function initWebGL() {
  gl.clearColor(backG, backG, backG, backA);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function render() {
  twgl.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.useProgram(programInfo.program);


  // TODO
}

// rendering
// --------------------------------------------------------------------------------- //
function setForeground(r, g, b) {
  foreR = r / 256; foreG = g / 256; foreB = b / 256; foreA = fancyAlpha(r, g, b);
}

function setBackground(r, g, b) {
  backR = r / 256; backG = g / 256; backB = b / 256; backA = fancyAlpha(r, g, b);
}

function set(x, y, value, vertical = false) {
  for (var i = 0; i < value.length; i++) {
    if (vertical)
      matrix[(y - 1 + i) * WIDTH + x - 1] = FONT[value.charCodeAt(i)];
    else
      matrix[(y - 1) * WIDTH + x - 1 + i] = FONT[value.charCodeAt(i)];
  }
}

function copy(x, y, width, height, xt, yt) {
  // TODO
}

function fill(x, y, width, height, value) {
  var char = value.charCodeAt(0);
  for (var iy = y - 1; iy < y + height - 1; iy++) {
    for(var ix = x - 1; ix < x + width - 1; ix++) {
      matrix[iy * WIDTH + ix] = FONT[char];
    }
  }
}

function setResolution(width, height) {
  // resize canvas
  if (WIDTH != width || HEIGHT != height) {
    WIDTH = width; HEIGHT = height;
    WIDTH_PX = WIDTH * CHAR_WIDTH;
    HEIGHT_PX = HEIGHT * CHAR_HEIGHT;
    terminal.width = WIDTH_PX;
    terminal.height = HEIGHT_PX;
    calculateBounds();
  }
}
