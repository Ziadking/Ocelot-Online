import { registerMouseEventTarget, unregisterMouseEventTarget } from "../../controller/window.js";
import { state } from "../../state.js";

import { BlockMove } from "../../network/packet/block-move.js";
import { send } from "../../network/network.js";

/**
 * The block view can be in two states - folded and unfolded.
 * When folded the block shows a rectangular block with layered textures and address at the bottom.
 * When unfolded it shows some kind of interface - the exact interface is determined by the block type.
 */

export class BlockView {
  constructor(vnode) {
    this.block = vnode.attrs.block;
    this.parent = vnode.attrs.parent;
    this.folded = this.block.folded;
    this.width = this.block.width;
    this.height = this.block.height;
  }

  /**
   * This interface is a container for block interface.
   * It manages the position of block and the ability to drag the block.
   */
  basicInterface(vnode, children) {
    return m("div", {
      class: "crisp workspace-block noselect",
      onmousedown: event => {
        if (event.button == 0) { // left mouse button
          this.isDragged = true;
          this.dragStartMouseX = event.clientX;
          this.dragStartMouseY = event.clientY;
          this.dragStartBlockX = this.block.x;
          this.dragStartBlockY = this.block.y;
          registerMouseEventTarget(this);
        }
      },
      oncontextmenu: event => { // right mouse button
        this.onContextMenu(event);
      },
      ondragstart: function() {
        return false;
      },
      style: {
        left: (this.parent.x + this.block.x - this.block.width / 2) + "px",
        top: (this.parent.y + this.block.y - this.block.height / 2) + "px",
        "z-index": this.isDragged ? 2 : 0,
      },
    },
      [ m("div", {
        class: "content",
        style: {
          width: this.width + "px",
          height: this.height + "px",
        }
      }, children),
      m("div", { class: "address", style: { width: this.width + "px" } }, this.block.address) ]
    );
  }

  /**
   * The interface of a square block, with texture and overlays.
   * This is the default block UI in folded state.
   */
  blockInterface(vnode) {
    let elements = this.block.textures.map(texture =>
      m("img", {
        class: "texture",
        src: texture.url,
        style: {
          visibility: texture.visible ? "visible" : "hidden",
          width: this.width + "px",
          height: this.height + "px",
          left: texture.x,
          top: texture.y,
        }
      })
    );
    return elements;
  }

  onMouseDown(event) {}

  onMouseMove(event) {
    if (this.isDragged) {
      // update block position on the screen
      let x = this.dragStartBlockX + (event.clientX - this.dragStartMouseX);
      let y = this.dragStartBlockY + (event.clientY - this.dragStartMouseY);
      let workspace = state.workspace.current.value;
      if (workspace) workspace.moveBlock(this.block, x, y);
      m.redraw();

      // notify backend
      send(BlockMove.encode(0, this.block.id, this.block.x, this.block.y));
    }
  }

  onMouseUp(event) {
    this.isDragged = false;
    unregisterMouseEventTarget(this);
    m.redraw();
  }

  onContextMenu(event) {
    event.preventDefault();
  }

  view(vnode) {
    if (this.folded || !this.detailsInterface) {
      return this.basicInterface(vnode, this.blockInterface(vnode));
    } else {
      return this.basicInterface(vnode, this.detailsInterface(vnode));
    }
  }
}
