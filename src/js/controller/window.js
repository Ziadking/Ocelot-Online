import { state } from "../state.js";

let initialized = false;
let mouseEventTargets = [];

export function registerMouseEventTarget(target) {
  mouseEventTargets.push(target);
}

export function unregisterMouseEventTarget(target) {
  let index = mouseEventTargets.indexOf(target);
  if (index > -1) mouseEventTargets.splice(index, 1);
}

export function init() {
  if (!initialized) {
    window.addEventListener("mousedown", event => {
      // redraw here will be called too soon - some elements may want to react on the event
      // they can call m.redraw() themselves
      event.redraw = false;
      mouseEventTargets.map(target => target.onMouseDown(event));
    });
    window.addEventListener("mousemove", event => {
      event.redraw = false;
      state.mouseX = event.clientX;
      state.mouseY = event.clientY;
      mouseEventTargets.map(target => target.onMouseMove(event));
    });
    window.addEventListener("mouseup", event => {
      event.redraw = false;
      mouseEventTargets.map(target => target.onMouseUp(event));
    });
    initialized = true;
  }
}
