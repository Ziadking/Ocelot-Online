// DOM elements
// --------------------------------------------------------------------------------- //

var ui = {
  init: function() {
    // build interface
    ui.container = document.getElementById('container');
  }
}

var container = document.getElementById('container');
var titlebar = document.getElementById('titlebar');
var watermark = document.getElementById('watermark');
var terminal = document.getElementById('terminal');
var footer = document.getElementById('footer');

var turnOnButton = document.getElementById('turn_on_button');
var turnOffButton = document.getElementById('turn_off_button');
var onlineCounter = document.getElementById('online');

var style = getComputedStyle(terminal, null);
var verticalBorder = parseInt(style.getPropertyValue("border-top-width"));
var horizontalBorder = parseInt(style.getPropertyValue("border-left-width"));

// position of the terminal in the browser window (used to calculate relative mouse click coordinates)
var bounds = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 };

function calculateBounds() {
  var rect = terminal.getBoundingClientRect();
  bounds.left = rect.left + horizontalBorder;
  bounds.right = rect.right - horizontalBorder;
  bounds.width = rect.width - horizontalBorder * 2;
  bounds.top = rect.top + verticalBorder;
  bounds.bottom = rect.bottom - verticalBorder;
  bounds.height = rect.height - verticalBorder * 2;
}
