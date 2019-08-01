"use strict";

// init
// --------------------------------------------------------------------------------- //

window.onload = function() {
  ui.init();
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
