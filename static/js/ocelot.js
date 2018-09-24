// init environment
var width = 80;
var height = 25;
var margin = 10;

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
  context.fillText(value, px, py + 13);
}

function numberToColour(number) {
  const r = (number & 0xff0000) >> 16;
  const g = (number & 0x00ff00) >> 8;
  const b = (number & 0x0000ff);
  return [r, g, b];
}

// connect to the server
var socket = new WebSocket("ws://" + host + ":" + port + "/stream");

socket.onmessage = function (event) {
  var message = event.data;
  var parts = message.split(" ");
  switch (parts[0]) {
    case 'beep':
      console.log("Beep: " + parts[1] + ", " + parts[2]);
      break;
    case 'beep-pattern':
      console.log("Beep: " + parts[1]);
      break;
    case 'crash':
      console.log("Crash: " + parts[1]);
      break;
    case 'set':
      set(parseInt(parts[1]), parseInt(parts[2]), message.substring(parts[0].length + parts[1].length + parts[2].length + parts[3].length + 4))
      break;
    case 'foreground':
      var color = numberToColour(parseInt(parts[1]))
      setForeground(color[0], color[1], color[2])
      break;
    case 'background':
      var color = numberToColour(parseInt(parts[1]))
      setBackground(color[0], color[1], color[2])
      break;
  }
}
