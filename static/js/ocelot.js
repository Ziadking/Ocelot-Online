// environment
// --------------------------------------------------------------------------------- //
var width = 80;
var height = 25;

var charWidth = 8;
var charHeight = 16;

var pixelWidth = width * charWidth;
var pixelHeight = height * charHeight;

var foreR = 255, foreG = 255, foreB = 255, foreA = 255;
var backR = 0, backG = 0, backB = 0, backA = 255 * 0.8;

var bounds = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };

// ui elements
// --------------------------------------------------------------------------------- //
var container = document.getElementById('container');

var terminal = document.getElementById('terminal');
var context = terminal.getContext('2d');
var contextData;
var data;

var watermark = document.getElementById('watermark');

var turnOnButton = document.getElementById('turn_on_button');
var turnOffButton = document.getElementById('turn_off_button');
var onlineCounter = document.getElementById('online');

// font data
// --------------------------------------------------------------------------------- //
var type = {
  'jBinary.all': 'File',
 Char: {
   code: 'uint16',
   width: 'byte',
   matrix: ['array', 'byte', 'width']
 },
 File: ['array', 'Char']
}

var font = {};

function loadFont() {
  jBinary.load('fonts/unscii-16.bin', type, function(error, data) {
    if (error == null) {
      var array = data.readAll();
      array.forEach(function (char) {
        font[char.code] = char.matrix;
      })
    } else {
      console.error(error);
    }
  })
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

function bit(byte, n) {
  return (byte >> n) & 1 != 0;
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
  foreR = r; foreG = g; foreB = b; foreA = fancyAlpha(r, g, b) * 255;
}

function setBackground(r, g, b) {
  backR = r; backG = g; backB = b; backA = fancyAlpha(r, g, b) * 255;
}

function updateContextData() {
  contextData = context.getImageData(0, 0, pixelWidth, pixelHeight);
  data = contextData.data;
}

function fillChar(char, px, py) {
  var matrix = char != 32 && char != 0 ? font[char] : undefined;
  for (var y = 0; y < charHeight; y++) {
    for (var x = 0; x < charWidth; x++) {
      var index = ((y + py) * pixelWidth + x + px) * 4;
      var filled = false;
      if (matrix) {
        var matrixIndex = (y * charWidth + x)
        filled = bit(matrix[Math.floor(matrixIndex / 8)], 7 - matrixIndex % 8);
      }
      if (filled) {
        data[index] = foreR;
        data[index + 1] = foreG;
        data[index + 2] = foreB;
        data[index + 3] = foreA;
      } else {
        data[index] = backR;
        data[index + 1] = backG;
        data[index + 2] = backB;
        data[index + 3] = backA;
      }
    }
  }
}

function fillText(text, px, py, vertical = false) {
  for (var i = 0; i < text.length; i++) {
    if (vertical)
      fillChar(text.charCodeAt(i), px, py + i * charHeight);
    else
      fillChar(text.charCodeAt(i), px + i * charWidth, py);
  }
}

function flush() {
  context.putImageData(contextData, 0, 0);
}

function set(x, y, value, vertical = false) {
  var px = x * charWidth;
  var py = y * charHeight;
  fillText(value, px, py, vertical);
  flush();
}

function copy(x, y, width, height, xt, yt) {
  var px = x * charWidth;
  var py = y * charHeight;
  var tpx = (x + xt) * charWidth;
  var tpy = (y + yt) * charHeight;
  var fragment = context.getImageData(px, py, width * charWidth, height * charHeight);
  context.putImageData(fragment, tpx, tpy);
  updateContextData();
}

function fill(x, y, width, height, value) {
  var char = value.charCodeAt(0);
  for (var py = y * charHeight; py < (y + height) * charHeight; py += charHeight) {
    for (var px = x * charWidth; px < (x + width) * charWidth; px += charWidth) {
      fillChar(char, px, py);
    }
  }
  flush();
}

function setResolution(w, h) {
  // resize canvas
  if (w != width || h != height) {
    width = w; height = h;
    pixelWidth = width * charWidth;
    pixelHeight = height * charHeight;
    terminal.width = pixelWidth;
    terminal.height = pixelHeight;
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
        break;
      case 'beep-pattern':
        console.log("Beep: " + parts[1]);
        break;
      case 'crash':
        console.log("Crash: " + parts[1]);
        alert("Crash: " + parts[1] + "!");
        break;
      case 'set':
        set(parseInt(parts[1]), parseInt(parts[2]), parts[4], parts[3] == "true");
        break;
      case 'foreground':
        var color = numberToColour(parseInt(parts[1]));
        setForeground(color[0], color[1], color[2]);
        break;
      case 'background':
        var color = numberToColour(parseInt(parts[1]));
        setBackground(color[0], color[1], color[2]);
        break;
      case 'copy':
        copy(parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]),
             parseInt(parts[5]), parseInt(parts[6]));
        break;
      case 'fill':
        fill(parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]), parts[5]);
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
          set(x, y, value);
        }
        // set colors to current
        setForeground(fore[0], fore[1], fore[2]);
        setBackground(back[0], back[1], back[2]);
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
  return Math.floor(Math.min(pixelWidth - 1, Math.max(0, e.clientX - bounds.left)) / charWidth);
}

function relativeY(e) {
  return Math.floor(Math.min(pixelHeight - 1, Math.max(0, e.clientY - bounds.top)) / charHeight);
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
  49: 0x02, 50: 0x03, 51: 0x04, 52: 0x05, 53: 0x06,
  54: 0x07, 55: 0x08, 56: 0x09, 57: 0x0A, 48: 0x0B,
  65: 0x1E, 66: 0x30, 67: 0x2E, 68: 0x20, 69: 0x12,
  70: 0x21, 71: 0x22, 72: 0x23, 73: 0x17, 74: 0x24,
  75: 0x25, 76: 0x26, 77: 0x32, 78: 0x31, 79: 0x18,
  80: 0x19, 81: 0x10, 82: 0x13, 83: 0x1F, 84: 0x14,
  85: 0x16, 86: 0x2F, 87: 0x11, 88: 0x2D, 89: 0x15,
  90: 0x2C, 222: 0x28, 50: 0x91, 8: 0x0E, 220: 0x2B,
  20: 0x3A, 59: 0x92, 188: 0x33, 13: 0x1C, 61: 0x0D,
  192: 0x29, 219: 0x1A, 17: 0x1D, 18: 0x38, 16: 0x2A,
  173: 0x0C, 144: 0x45, 190: 0x34, 221: 0x1B, 191: 0x35,
  32: 0x39, 9: 0x0F, 38: 0xC8, 40: 0xD0, 37: 0xCB,
  39: 0xCD, 36: 0xC7, 35: 0xCF, 33: 0xC9, 34: 0xD1,
  45: 0xD2, 46: 0xD3, 112: 0x3B, 113: 0x3C, 114: 0x3D,
  115: 0x3E, 116: 0x3F, 117: 0x40, 118: 0x41, 119: 0x42,
  120: 0x43, 121: 0x44, 122: 0x57, 123: 0x58
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

// init
// --------------------------------------------------------------------------------- //
window.onload = function() {
  // dom
  document.getElementById('version').innerHTML = version;
  // graphics
  calculateBounds();
  if (isMobile()) terminal.contentEditable = true;
  context.fillStyle = "rgba(0, 0, 0, 0.8)";
  context.fillRect(0, 0, pixelWidth, pixelHeight);
  updateContextData();
  // fonts
  loadFont();
  // network
  if (host.endsWith("/")) host = host.substring(0, host.length - 1);
  socket = new WebSocket(host + "/stream");
  subscribeOnSocketEvents();
  // show terminal, turn off loading animation
  terminal.style.visibility = 'visible';
  watermark.classList.remove('spinning');
}
