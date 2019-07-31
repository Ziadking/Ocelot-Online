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
