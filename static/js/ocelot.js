// init environment
var width = 80;
var height = 25;

// init terminal
var elements = document.getElementsByClassName("line");
var lines = [];
for (var i = 0; i < elements.length; i++) {
  lines.push(elements[i].textContent);
}

function set(x, y, value) {
  var line = lines[y];
  lines[y] = line.substr(0, x) + value + line.substr(x + value.length);
  elements[y].textContent = lines[y];
}

// connect to the server
var socket = new WebSocket("ws://localhost:8080/stream");

socket.onmessage = function (event) {
  set(Math.floor(Math.random() * (width - event.data.length)), Math.floor(Math.random() * height), event.data);
}
