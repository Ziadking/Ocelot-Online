import { state } from "../state.js";

let initialized = false;
let blockBeingDragged = undefined;

export function blockIsBeingDragged(block) {
  blockBeingDragged = block;
}

export function noBlockIsBeingDragged() {
  blockBeingDragged = undefined;
}

export function init() {
  if (!initialized) {
    window.addEventListener("mousemove", event => {
      event.redraw = false;
      if (blockBeingDragged) {
        blockBeingDragged.onMouseMove(event);
      }
    });
    window.addEventListener("mouseup", event => {
      event.redraw = false;
      if (blockBeingDragged) {
        blockBeingDragged.onMouseUp(event);
      }
    });
    initialized = true;
  }
}
