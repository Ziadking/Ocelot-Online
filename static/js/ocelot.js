// environment
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

// position of the terminal in the browser window (used to calculate relative mouse click coordinates)
var bounds = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };

// current colors
var foreR = 1, foreG = 1, foreB = 1, foreA = 1;
var backR = 0, backG = 0, backB = 0, backA = 0.8;

// matrix of chars
var matrix = new Uint16Array(WIDTH * HEIGHT);

// ui elements
// --------------------------------------------------------------------------------- //
var container = document.getElementById('container');
var titlebar = document.getElementById('titlebar');
var watermark = document.getElementById('watermark');
var terminal = document.getElementById('terminal');
var footer = document.getElementById('footer');

var turnOnButton = document.getElementById('turn_on_button');
var turnOffButton = document.getElementById('turn_off_button');
var onlineCounter = document.getElementById('online');

// webgl
// --------------------------------------------------------------------------------- //
var gl = terminal.getContext('webgl');
if (!gl) {
  alert("Your browser does not support WebGL!");
}

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

// util methods
// --------------------------------------------------------------------------------- //
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

function numberToColour(number) {
  const r = (number & 0xff0000) >> 16;
  const g = (number & 0x00ff00) >> 8;
  const b = (number & 0x0000ff);
  return [r, g, b];
}

function lightness(r, g, b) {
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  return (max + min) / 2;
}

var fancyAlphaThreshold = 80;
function fancyAlpha(r, g, b) {
  var l = lightness(r, g, b);
  if (l > fancyAlphaThreshold) return 1.0;
  else return 0.8 + (l / fancyAlphaThreshold) * 0.2;
}

function isMobile() {
  return typeof window.orientation !== 'undefined';
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

var style = getComputedStyle(terminal, null);
var verticalBorder = parseInt(style.getPropertyValue("border-top-width"));
var horizontalBorder = parseInt(style.getPropertyValue("border-left-width"));

function calculateBounds() {
  var rect = terminal.getBoundingClientRect();
  bounds.left = rect.left + horizontalBorder;
  bounds.right = rect.right - horizontalBorder;
  bounds.width = rect.width - horizontalBorder * 2;
  bounds.top = rect.top + verticalBorder;
  bounds.bottom = rect.bottom - verticalBorder;
  bounds.height = rect.height - verticalBorder * 2;
}

// network
// --------------------------------------------------------------------------------- //
var socket;

function subscribeOnSocketEvents() {
  socket.onmessage = function (event) {
    var message = event.data;
    var parts = message.split("\n");
    switch (parts[0]) {
      case 'beep':
        console.log("Beep: " + parts[1] + ", " + parts[2]);
        playSound(parseInt(parts[1]), parseInt(parts[2]));
        break;
      case 'beep-pattern':
        console.log("Beep: " + parts[1]);
        for (var i = 0; i < parts[1].length; i++) {
          var char = parts[1].chatAt(i);
          if (char == '.') {
            playSound(1000, 200)
          } else {
            playSound(1000, 400)
          }
        }
        break;
      case 'crash':
        console.error("Crash: " + parts[1]);
        alert("Crash: " + parts[1] + "!");
        break;
      case 'set':
        set(parseInt(parts[1]), parseInt(parts[2]), parts[4], parts[3] == "true");
        render();
        break;
      case 'foreground':
        var color = numberToColour(parseInt(parts[1]));
        setForeground(color[0], color[1], color[2]);
        render();
        break;
      case 'background':
        var color = numberToColour(parseInt(parts[1]));
        setBackground(color[0], color[1], color[2]);
        render();
        break;
      case 'copy':
        copy(parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]),
             parseInt(parts[5]), parseInt(parts[6]));
        render();
        break;
      case 'fill':
        fill(parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]), parts[5]);
        render();
        break;
      case 'state':
        // update resolution if necessary
        setResolution(parseInt(parts[1]), parseInt(parts[2]));
        // read current colors
        var fore = numberToColour(parseInt(parts[3]));
        var back = numberToColour(parseInt(parts[4]));
        // read and apply all changes
        for (var i = 5; i < parts.length; i += 5) {
          if (i + 4 >= parts.length) break;
          var x = parseInt(parts[i]);
          var y = parseInt(parts[i + 1]);
          var f = numberToColour(parseInt(parts[i + 2]));
          var b = numberToColour(parseInt(parts[i + 3]));
          var value = parts[i + 4];
          setForeground(f[0], f[1], f[2]);
          setBackground(b[0], b[1], b[2]);
          set(x, y, value, false, false);
        }
        // set colors to current
        setForeground(fore[0], fore[1], fore[2]);
        setBackground(back[0], back[1], back[2]);
        render();
        break;
      case 'turnon-failure':
        turnOnButton.classList.remove('warning');
        void turnOnButton.offsetWidth; // black magic - triggering element reflow
        turnOnButton.classList.add('warning');
        break;
      case 'turnoff-failure':
        turnOffButton.classList.remove('warning');
        void turnOffButton.offsetWidth; // black magic - triggering element reflow
        turnOffButton.classList.add('warning');
        break;
      case "resolution":
        // update the state
        askForState();
        break;
      case "online":
        onlineCounter.innerHTML = parts[1];
    }
  }
  socket.onopen = function() {
    askForState();
    socket.send("online");
  }
}

// subscribe to user feedback
// --------------------------------------------------------------------------------- //
function relativeX(e) {
  return Math.floor(Math.min(WIDTH_PX - 1, Math.max(0, e.clientX - bounds.left)) / CHAR_WIDTH);
}

function relativeY(e) {
  return Math.floor(Math.min(HEIGHT_PX - 1, Math.max(0, e.clientY - bounds.top)) / CHAR_HEIGHT);
}

var mousePressed = false
terminal.onmousedown = function(e) {
  mousePressed = true
  socket.send("mousedown " + relativeX(e) + " " + relativeY(e) + " " + e.buttons);
}

terminal.onmouseup = function(e) {
  mousePressed = false
  socket.send("mouseup " + relativeX(e) + " " + relativeY(e) + " " + e.buttons);
}

terminal.onmousemove = function(e) {
  if (mousePressed) {
    socket.send("mousedrag " + relativeX(e) + " " + relativeY(e) + " " + e.buttons);
  }
}

terminal.onwheel = function(e) {
  socket.send("mousewheel " + relativeX(e) + " " + relativeY(e) + " " + (-e.deltaY / 3));
  return false;
}

terminal.oncontextmenu = function(e) {
  return false;
}

var codes = {
  27: 0x01, 49: 0x02, 50: 0x03, 51: 0x04, 52: 0x05,
  53: 0x06, 54: 0x07, 55: 0x08, 56: 0x09, 57: 0x0A,
  48: 0x0B, 65: 0x1E, 66: 0x30, 67: 0x2E, 68: 0x20,
  69: 0x12, 70: 0x21, 71: 0x22, 72: 0x23, 73: 0x17,
  74: 0x24, 75: 0x25, 76: 0x26, 77: 0x32, 78: 0x31,
  79: 0x18, 80: 0x19, 81: 0x10, 82: 0x13, 83: 0x1F,
  84: 0x14, 85: 0x16, 86: 0x2F, 87: 0x11, 88: 0x2D,
  89: 0x15, 90: 0x2C, 222: 0x28, 50: 0x91, 8: 0x0E,
  220: 0x2B, 20: 0x3A, 59: 0x92, 188: 0x33, 13: 0x1C,
  61: 0x0D, 192: 0x29, 219: 0x1A, 17: 0x1D, 18: 0x38,
  16: 0x2A, 173: 0x0C, 144: 0x45, 190: 0x34, 221: 0x1B,
  191: 0x35, 32: 0x39, 9: 0x0F, 38: 0xC8, 40: 0xD0,
  37: 0xCB, 39: 0xCD, 36: 0xC7, 35: 0xCF, 33: 0xC9,
  34: 0xD1, 45: 0xD2, 46: 0xD3, 112: 0x3B, 113: 0x3C,
  114: 0x3D, 115: 0x3E, 116: 0x3F, 117: 0x40, 118: 0x41,
  119: 0x42, 120: 0x43, 121: 0x44, 122: 0x57, 123: 0x58
}
var keyControl = 17;
var keyC = 67;
var keyV = 86;
var keyEnter = 13;
var keyTab = 9;
var keyBackspace = 8;

var isControlPressed = false;
var isKeyBoardDirty = false;

// do not prevent standart browser behavior for these buttons
var whitelisted = [keyControl, keyV];
// these keys do have their own character code that is equal to their key code
var special = [keyTab, keyBackspace, keyEnter];

document.onpaste = function(e) {
  socket.send("clipboard " + e.clipboardData.getData('text'));
}

function getCharCode(e) {
  if (special.includes(e.keyCode)) {
    return e.keyCode;
  } else if (isControlPressed && e.keyCode == keyC) {
    // send EOT code here for Ctrl + C sequence
    return 0x04
  } else if (e.key.length == 1) {
    return e.key.charCodeAt(0)
  } else {
    return 0;
  }
}

document.onkeydown = function(e) {
  e = e || window.event;
  if (e.keyCode == keyControl) isControlPressed = true;
  if (!(e.keyCode == keyV && isControlPressed)) {
    var charCode = getCharCode(e);
    var keyCode = codes[e.keyCode] || e.keyCode;
    socket.send("keydown " + charCode + " " + keyCode);
    isKeyBoardDirty = true;
  }
  return whitelisted.includes(e.keyCode);
};

document.onkeyup = function(e) {
  e = e || window.event;
  if (e.keyCode == keyControl) isControlPressed = false;
  var charCode = getCharCode(e);
  var keyCode = codes[e.keyCode] || e.keyCode;
  socket.send("keyup " + charCode + " " + keyCode);
  return whitelisted.includes(e.keyCode);
};

document.onblur = function(e) {
  if (isKeyBoardDirty) {
    socket.send("keyup-all");
    isControlPressed = false;
    isKeyBoardDirty = false;
  }
}

function turnOn() {
  socket.send("turnon");
}
function turnOff() {
  socket.send("turnoff");
}
function askForState() {
  socket.send("state");
}

// audio
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(frequency, duration) {
  var oscillator = audioContext.createOscillator();
  var gain = audioContext.createGain();
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  gain.gain.value = 0.1;
  oscillator.type = 'square';
  oscillator.frequency.value = frequency;
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration / 1000);
}

// init
// --------------------------------------------------------------------------------- //
window.onload = function() {
  // dom
  document.getElementById('version').innerHTML = version;
  // graphics
  calculateBounds();
  if (isMobile()) terminal.contentEditable = true;
  initWebGL();
  // network
  if (host.endsWith("/")) host = host.substring(0, host.length - 1);
  socket = new WebSocket(host + "/stream");
  subscribeOnSocketEvents();
  // show terminal, turn off loading animation
  titlebar.style.visibility = 'visible';
  terminal.style.visibility = 'visible';
  footer.style.visibility = 'visible';
  watermark.classList.remove('spinning');
}
