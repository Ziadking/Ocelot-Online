// init environment
var width = 80;
var height = 25;

var margin = 10;
var fontOffset = 12;

var foreColor = "rgba(255, 255, 255, 1.0)";
var backColor = "rgba(0, 0, 0, 0.8)";

// init terminal
var terminal = document.getElementById('terminal');
var context = terminal.getContext('2d');
context.font = '16px unscii';

context.fillStyle = backColor;
context.fillRect(0, 0, terminal.width, terminal.height);

function setForeground(r, g, b) {
  foreColor = "rgba(" + r + ", " + g + ", " + b + ", 1.0)";
  context.fillStyle = foreColor;
}

function setBackground(r, g, b) {
  backColor = "rgba(" + r + ", " + g + ", " + b + ", 0.8)";
}

function set(x, y, value) {
  var px = margin * 1.5 + x * 8;
  var py = margin + y * 16;
  context.clearRect(px, py, 8 * value.length, 16);
  context.fillStyle = backColor;
  context.fillRect(px, py, 8 * value.length, 16);
  context.fillStyle = foreColor;
  context.fillText(value, px, py + fontOffset);
}

function numberToColour(number) {
  const r = (number & 0xff0000) >> 16;
  const g = (number & 0x00ff00) >> 8;
  const b = (number & 0x0000ff);
  return [r, g, b];
}

function copy(x, y, width, height, xt, yt) {
  var px = margin * 1.5 + x * 8;
  var py = margin + y * 16;
  var tpx = margin * 1.5 + (x + xt) * 8;
  var tpy = margin + (y + yt) * 16;
  var fragment = context.getImageData(px, py, width * 8, height * 16);
  context.putImageData(fragment, tpx, tpy);
}

function fill(x, y, width, height, value) {
  var px = margin * 1.5 + x * 8;
  var py = margin + y * 16;
  context.clearRect(px, py, width * 8, height * 16);
  context.fillStyle = backColor;
  context.fillRect(px, py, width * 8, height * 16);
  context.fillStyle = foreColor;
  var line = value.charAt(0).repeat(width);
  for (var i = 0; i < height; i++) {
    context.fillText(line, px, py + fontOffset + i * 16);
  }
}

// connect to the server
var socket = new WebSocket("ws://" + host + ":" + port + "/stream");

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
      set(parseInt(parts[1]), parseInt(parts[2]), parts[4])
      break;
    case 'foreground':
      var color = numberToColour(parseInt(parts[1]))
      setForeground(color[0], color[1], color[2])
      break;
    case 'background':
      var color = numberToColour(parseInt(parts[1]))
      setBackground(color[0], color[1], color[2])
      break;
    case 'copy':
      copy(parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]),
           parseInt(parts[5]), parseInt(parts[6]));
      break;
    case 'fill':
      fill(parseInt(parts[1]), parseInt(parts[2]), parseInt(parts[3]), parseInt(parts[4]), parts[5]);
      break;
  }
}

// subscribe to user feedback
var codes = {
  Enter: 0x1C,
  ArrowLeft: 0xCB,
  ArrowUp: 0xC8,
  ArrowRight: 0xCD,
  ArrowDown: 0xD0,
  Home: 0xC7,
  End: 0xCF,
  PageUp: 0xC9,
  PageDown: 0xD1,
  Insert: 0xD2,
  Delete: 0xD3,
  Backspace: 0x0E,
  CapsLock: 0x3A,
  Control: 0x1D,
  Alt: 0x38,
  Shift: 0x2A,
  NumLock: 0x45,
  ScrollLock: 0x46,
  Tab: 0x0F,
  F1: 0x3B,
  F2: 0x3C,
  F3: 0x3D,
  F4: 0x3E,
  F5: 0x3F,
  F6: 0x40,
  F7: 0x41,
  F8: 0x42,
  F9: 0x43,
  F10: 0x44,
  F11: 0x57,
  F12: 0x58,
  F13: 0x64,
  F14: 0x65,
  F15: 0x66,
  F16: 0x67,
  F17: 0x68,
  F18: 0x69,
  F19: 0x71
}

document.onkeydown = function (e) {
    e = e || window.event;
    var charCode = e.key.length == 1 ? e.key.charCodeAt(0) : 0;
    var keyCode = codes[e.key] || e.keyCode;
    socket.send("keydown " + charCode + " " + keyCode);
    return false;
};

document.onkeyup = function (e) {
    e = e || window.event;
    var charCode = e.key.length == 1 ? e.key.charCodeAt(0) : 0;
    var keyCode = codes[e.key] || e.keyCode;
    socket.send("keyup " + charCode + " " + keyCode);
    return false;
};
