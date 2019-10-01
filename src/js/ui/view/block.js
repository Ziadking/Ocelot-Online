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
    this.folded = true;
  }

  blockInterface(vnode) {
    let block = vnode.attrs.block;
    let parent = vnode.attrs.parent;
    let elements = [
      m("img", { src: block.texture })
    ];
    if (block.overlays) {
      block.overlays.map(overlay => elements.push(
        m("img", {
          id: overlay.id,
          class: "overlay",
          src: overlay.texture,
          style: "width: " + BLOCK_SIZE + "px; " + (overlay.visible ? "" : "display: none;") })
      ));
    }
    return m("div", {
      class: "crisp workspace-block noselect",
      onmousedown: event => {
        if (event.button == 0) { // left mouse button
          this.isDragged = true;
          this.dragStartMouseX = event.clientX;
          this.dragStartMouseY = event.clientY;
          this.dragStartBlockX = block.x;
          this.dragStartBlockY = block.y;
          registerMouseEventTarget(this);
        }
      },
      oncontextmenu: event => { // right mouse button
        this.onContextMenu(event);
      },
      ondragstart: function() {
        return false;
      },
      style: "width: " + BLOCK_SIZE + "px; " +
             leftTop(parent.x + block.x - BLOCK_BORDER, parent.y + block.y - BLOCK_BORDER, BLOCK_SIZE, BLOCK_SIZE),
    }, [
      m("div", { class: "texture" }, elements),
      m("div", { class: "address" }, block.address)
    ]);
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
    this.folded = !this.folded;
  }

  view(vnode) {
    if (this.folded || !this.detailsInterface) {
      return this.blockInterface(vnode);
    } else {
      return this.detailsInterface(vnode);
    }
  }
}
