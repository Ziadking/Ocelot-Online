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

// connect to the server
var socket = new WebSocket("ws://" + host + ":" + port + "/stream");

socket.onmessage = function (event) {
  console.log(event);
}
