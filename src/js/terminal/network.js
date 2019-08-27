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

function turnOn() {
  socket.send("turnon");
}
function turnOff() {
  socket.send("turnoff");
}
function askForState() {
  socket.send("state");
}
