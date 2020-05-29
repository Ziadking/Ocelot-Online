import { state } from "../../state.js";
import { Event, Bus } from "../../event.js";
import { BlockTypes } from "../../const/blocktypes.js";

import { Loader } from "../view/loader.js";
import { WireView } from "../view/wire.js";
import { BlockView } from "../view/block.js";
import { BlockScreenView } from "../view/block-screen.js";
import { BlockCaseView } from "../view/block-case.js";

import { registerMouseEventTarget, unregisterMouseEventTarget } from "../../controller/window.js";

import { getWidth, getHeight } from "../../util/helpers.js";

import { awakePointer } from "../pointers.js";

import { Mouse } from "../../network/packet/mouse.js";
import { WorkspaceGetState } from "../../network/packet/workspace-get-state.js";
import { send } from "../../network/network.js";

export class WorkspacePage {

  oninit(vnode) {
    this.ID = "WORKSPACE";
    // init stuff
    let id = vnode.attrs.id;
    if (state.workspace.current.value == undefined || state.workspace.current.value.id != id) {
      state.workspace.current.value = state.workspace.list.value.find(w => w.id == id);
    }
    registerMouseEventTarget(this);
    Bus.sub(this.ID, Event.REMOTE_MOUSE_MOVE, function(data) {
      var workspace = state.workspace.current.value;
      if (workspace) {
        awakePointer(data.id, data.x + (workspace.x || 0), data.y + (workspace.y || 0), data.nickname);
      } else {
        awakePointer(data.id, data.x, data.y, data.nickname);
      }
    });
    // calculate coordinate plane center
    this.setPosition(getWidth() / 2, getHeight() / 2);
    // request update of workspace data
    state.workspace.current.loading = true;
    send(WorkspaceGetState.encode());
  }

  onupdate(vnode) {
    this.setPosition(this.x, this.y); // update the coordinates in workspace model
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    let workspace = state.workspace.current.value;
    if (workspace) {
      workspace.x = x;
      workspace.y = y;
    }
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
      this.setPosition(
        this.dragStartX + (event.clientX - this.dragStartMouseX),
        this.dragStartY + (event.clientY - this.dragStartMouseY)
      );
      m.redraw();
    }
    if (state.user) {
      send(Mouse.encode(0, state.user.id, event.clientX - this.x, event.clientY - this.y, state.user.nickname));
    }
  }

  onMouseUp(event) {
    this.isDragged = false;
  }

  onremove() {
    unregisterMouseEventTarget(this);
    Bus.unsub(this.ID, Event.REMOTE_MOUSE_MOVE);
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

    if (state.workspace.current.value) {
      // generate wires
      elements.push(
        Object.values(state.workspace.current.value.wires).map(wire => {
          return m(WireView, { wire: wire, parent: this })
        })
      );

      // generate blocks
      elements.push(
        Object.values(state.workspace.current.value.blocks).map(block => {
          return m(this.matchEntityView(block.type), { block: block, parent: this });
        })
      );
    }

    return elements;
  }
}
