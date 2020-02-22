import { leftTop } from "../../util/helpers.js";
import { registerMouseEventTarget, unregisterMouseEventTarget } from "../../controller/window.js";

let BLOCK_SIZE = 100;
let BLOCK_BORDER = 4;

/**
 * The block view can be in two states - folded and unfolded.
 * When folded the block shows a rectangular block with texture, address and overlays.
 * When unfolded it shows some kind of interface - the exact interface is determined by the block type.
 */

export class BlockView {
  constructor(vnode) {
    this.block = vnode.attrs.block;
    this.parent = vnode.attrs.parent;
    this.folded = true;
    this.width = BLOCK_SIZE;
    this.height = BLOCK_SIZE + 20;
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
      style: "width: " + this.width + "px; height: " + this.height + "px; " +
             leftTop(this.parent.x + this.block.x - BLOCK_BORDER, this.parent.y + this.block.y - BLOCK_BORDER, this.width, this.height),
    }, children);
  }

  /**
   * The interface of a square block, with texture and overlays.
   * This is the default block UI in folded state.
   */
  blockInterface(vnode) {
    let elements = [
      m("img", { src: this.block.texture })
    ];
    if (this.block.overlays) {
      this.block.overlays.map(overlay => elements.push(
        m("img", {
          id: overlay.id,
          class: "overlay",
          src: overlay.texture,
          style: "width: " + BLOCK_SIZE + "px; " + (overlay.visible ? "" : "display: none;") })
      ));
    }
    return [
      m("div", { class: "texture" }, elements),
      m("div", { class: "address" }, this.block.address)
    ];
  }

  onMouseDown(event) {}

  onMouseMove(event) {
    if (this.isDragged) {
      let x = this.dragStartBlockX + (event.clientX - this.dragStartMouseX);
      let y = this.dragStartBlockY + (event.clientY - this.dragStartMouseY);
      this.block.move(x, y);
      m.redraw();
    }
  }

  onMouseUp(event) {
    this.isDragged = false;
    unregisterMouseEventTarget(this);
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

export {BLOCK_SIZE, BLOCK_BORDER};
