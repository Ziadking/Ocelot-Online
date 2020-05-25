import { state } from "../../state.js";
import { BlockTypes } from "../../const/blocktypes.js";

import { Loader } from "../view/loader.js";
import { WireView } from "../view/wire.js";
import { BlockView } from "../view/block.js";
import { BlockScreenView } from "../view/block-screen.js";
import { BlockCaseView } from "../view/block-case.js";

import { registerMouseEventTarget, unregisterMouseEventTarget } from "../../controller/window.js";

import { getWidth, getHeight } from "../../util/helpers.js";

import { WorkspaceGetState } from "../../network/packet/workspace_get_state.js";
import { Mouse } from "../../network/packet/mouse.js";
import { send } from "../../network/network.js";

export class WorkspacePage {
  oninit(vnode) {
    // init stuff
    let id = vnode.attrs.id;
    if (state.workspace.current.value == undefined || state.workspace.current.value.id != id) {
      state.workspace.current.value = state.workspace.list.value.find(w => w.id == id);
    }
    registerMouseEventTarget(this);
    // calculate coordinate plane center
    this.x = getWidth() / 2;
    this.y = getHeight() / 2;
    // request update of workspace data
    send(WorkspaceGetState.encode());
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
    if (state.user) {
      send(Mouse.encode(0, state.user.id, event.clientX, event.clientY, state.user.nickname));
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
    let elements = [ m(Loader, { visible: state.workspace.current.loading }) ];

    if (state.workspace.current.value != undefined) {
      // generate wires
      elements.push(
        Object.values(state.workspace.current.value.wires).map(wire => {
          return m(WireView, { wire: wire, parent: this })
        })
      );

      // generate blocks
      elements.push(
        state.workspace.current.value.blocks.map(block => {
          return m(this.matchEntityView(block.entity), { block: block, parent: this });
        })
      );
    }

    return elements;
  }
}
