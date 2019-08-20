window.onload = function() {
  // init some constants and stuff
  ui.init();
  // routing
  m.route(ui.container, "/dash", {
      "/dash": page.Dashboard,
      "/dashboard": page.Dashboard,
      "/login": page.Login
  });
  // graphics
  calculateBounds();
  if (isMobile()) terminal.contentEditable = true;
  initWebGL();
  // network
  if (host.endsWith("/")) host = host.substring(0, host.length - 1);
  socket = new WebSocket(host + "/stream");
  subscribeOnSocketEvents();
}
