// init environment
var width = 80;
var height = 25;

var charWidth = 8;
var charHeight = 16;

var fontOffset = 13;

var foreColor = "rgba(255, 255, 255, 1.0)";
var backColor = "rgba(0, 0, 0, 0.8)";

// util methods
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

// init terminal
var terminal = document.getElementById('terminal');
var context = terminal.getContext('2d');
context.font = '16px unscii';

var bounds = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };

context.fillStyle = backColor;
context.fillRect(0, 0, terminal.width, terminal.height);

function setForeground(r, g, b) {
  foreColor = "rgba(" + r + ", " + g + ", " + b + ", " + fancyAlpha(r, g, b) + ")";
  context.fillStyle = foreColor;
}

function setBackground(r, g, b) {
  backColor = "rgba(" + r + ", " + g + ", " + b + ", " + fancyAlpha(r, g, b) + ")";
}

function set(x, y, value) {
  var px = x * charWidth;
  var py = y * charHeight;
  context.clearRect(px, py, charWidth * value.length, charHeight);
  context.fillStyle = backColor;
  context.fillRect(px, py, charWidth * value.length, charHeight);
  context.fillStyle = foreColor;
  context.fillText(value, px, py + fontOffset);
}

function copy(x, y, width, height, xt, yt) {
  var px = x * charWidth;
  var py = y * charHeight;
  var tpx = (x + xt) * charWidth;
  var tpy = (y + yt) * charHeight;
  var fragment = context.getImageData(px, py, width * charWidth, height * charHeight);
  context.putImageData(fragment, tpx, tpy);
}

function fill(x, y, width, height, value) {
  var px = x * charWidth;
  var py = y * charHeight;
  context.clearRect(px, py, width * charWidth, height * charHeight);
  context.fillStyle = backColor;
  context.fillRect(px, py, width * charWidth, height * charHeight);
  context.fillStyle = foreColor;
  var line = value.charAt(0).repeat(width);
  for (var i = 0; i < height; i++) {
    context.fillText(line, px, py + fontOffset + i * charHeight);
  }
}

function setResolution(w, h) {
  width = w; height = h;
  // resize canvas
  if (w != terminal.width || h != terminal.height) {
    terminal.width = width * charWidth;
    terminal.height = height * charHeight;
    // for some reason, after canvas changes it's size font settings drop to default
    context.font = '16px unscii';
  }
  calculateBounds();
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

// init some other ui elements
var turnOnButton = document.getElementById('turn_on_button');
var turnOffButton = document.getElementById('turn_off_button');

// connect to the server
if (host.endsWith("/")) host = host.substring(0, host.length - 1);
var socket = new WebSocket(host + "/stream");

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
      set(parseInt(parts[1]), parseInt(parts[2]), parts[4]);
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
  }
}

// subscribe to user feedback
function relativeX(e) {
  return Math.floor(Math.min(terminal.width - 1, Math.max(0, e.clientX - bounds.left)) / charWidth);
}
function relativeY(e) {
  return Math.floor(Math.min(terminal.height - 1, Math.max(0, e.clientY - bounds.top)) / charHeight);
}

var mousePressed = false
terminal.onmousedown = function(e) {
  mousePressed = true
  socket.send("mousedown " + relativeX(e) + " " + relativeY(e) + " " + e.buttons);
  return false;
}

terminal.onmouseup = function(e) {
  mousePressed = false
  socket.send("mouseup " + relativeX(e) + " " + relativeY(e) + " " + e.buttons);
  return false;
}

terminal.onmousemove = function(e) {
  if (mousePressed) {
    socket.send("mousedrag " + relativeX(e) + " " + relativeY(e) + " " + e.buttons);
    return false;
  }
}

terminal.onwheel = function(e) {
  socket.send("mousewheel " + relativeX(e) + " " + relativeY(e) + " " + e.deltaY / 3);
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

document.onkeydown = function (e) {
  e = e || window.event;
  var charCode = e.key.length == 1 ? e.key.charCodeAt(0) : 0;
  var keyCode = codes[e.keyCode] || e.keyCode;
  socket.send("keydown " + charCode + " " + keyCode);
  return false;
};

document.onkeyup = function (e) {
  e = e || window.event;
  var charCode = e.key.length == 1 ? e.key.charCodeAt(0) : 0;
  var keyCode = codes[e.keyCode] || e.keyCode;
  socket.send("keyup " + charCode + " " + keyCode);
  return false;
};

// additional callbacks
function turnOn() {
  socket.send("turnon");
}
function turnOff() {
  socket.send("turnoff");
}
function askForState() {
  socket.send("state")
}

// ask for the current terminal state
socket.onopen = function() {
  askForState();
}

// run additional DOM-dependents intialization code
window.onload = function() {
  calculateBounds();
  // set version label
  document.getElementById('version').innerHTML = version;
}
