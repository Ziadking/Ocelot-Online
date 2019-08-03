"use strict";

window.onload = function() {
  ui.init();
  // routing
  m.route(ui.container, "/dash", {
      "/dash": page.Dashboard
  });
  //
  document.getElementById('version').innerHTML = version;
  // graphics
  calculateBounds();
  if (isMobile()) terminal.contentEditable = true;
  initWebGL();
  // network
  if (host.endsWith("/")) host = host.substring(0, host.length - 1);
  socket = new WebSocket(host + "/stream");
  subscribeOnSocketEvents();
}
