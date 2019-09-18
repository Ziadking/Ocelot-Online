import { leftTop } from "../../util/helpers.js";
import { blockIsBeingDragged, noBlockIsBeingDragged } from "../../controller/window.js";

let BLOCK_SIZE = 100;
let BLOCK_BORDER = 4;

export class BlockView {
  constructor(vnode) {
    this.block = vnode.attrs.block;
  }

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
    noBlockIsBeingDragged();
  }

  view(vnode) {
    let block = vnode.attrs.block;
    return m("div", {
      class: "crisp workspace-block noselect",
      onmousedown: event => {
        this.isDragged = true;
        this.dragStartMouseX = event.clientX;
        this.dragStartMouseY = event.clientY;
        this.dragStartBlockX = block.x;
        this.dragStartBlockY = block.y;
        blockIsBeingDragged(this);
      },
      ondragstart: function() {
        return false;
      },
      style: "width: " + BLOCK_SIZE + "px; " + leftTop(block.x - BLOCK_BORDER, block.y - BLOCK_BORDER, BLOCK_SIZE, BLOCK_SIZE),
    }, [
      m("img", { src: block.texture }),
      m("div", block.address)
    ]);
  }
}
