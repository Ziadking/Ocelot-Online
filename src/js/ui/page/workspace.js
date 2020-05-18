import { state } from "../../state.js";
import { BlockTypes } from "../../const/blocktypes.js";

import { WireView } from "../view/wire.js";
import { BlockView } from "../view/block.js";
import { BlockScreenView } from "../view/block-screen.js";
import { BlockCaseView } from "../view/block-case.js";

import { init } from "../../controller/workspace.js";
import { registerMouseEventTarget, unregisterMouseEventTarget } from "../../controller/window.js";

import { getWidth, getHeight } from "../../util/helpers.js";

export class WorkspacePage {
  oninit() {
    init();
    registerMouseEventTarget(this);
    // calculate coordinate plane center
    this.x = getWidth() / 2;
    this.y = getHeight() / 2;
  }

  onMouseDown(event) {
    if (event.button == 1) { // middle mouse button
      this.isDragged = true;
      this.dragStartMouseX = event.clientX;
      this.dragStartMouseY = event.clientY;
      this.dragStartX = this.x;
      this.dragStartY = this.y;
    }
  }

  onMouseMove(event) {
    if (this.isDragged) {
      this.x = this.dragStartX + (event.clientX - this.dragStartMouseX);
      this.y = this.dragStartY + (event.clientY - this.dragStartMouseY);
      m.redraw();
    }
  }

  onMouseUp(event) {
    this.isDragged = false;
  }

  onremove() {
    unregisterMouseEventTarget(this);
  }

  matchEntityView(entity) {
    switch (entity) {
      case BlockTypes.SCREEN: return BlockScreenView;
      case BlockTypes.CASE: return BlockCaseView;
      default: return BlockView;
    }
  }

  view(vnode) {
    let id = vnode.attrs.id;
    state.workspace.current = state.workspace.all.find(w => w.id == id);
    let elements = [];

    if (state.workspace.current != undefined) {
      // generate wires
      elements.push(
        Object.values(state.workspace.current.wires).map(wire => {
          return m(WireView, { wire: wire, parent: this })
        })
      );

      // generate blocks
      elements.push(
        state.workspace.current.blocks.map(block => {
          return m(this.matchEntityView(block.entity), { block: block, parent: this });
        })
      );
    }

    return elements;
  }
}
