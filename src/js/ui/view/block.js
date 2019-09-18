import { leftTop } from "../../util/helpers.js";

let BLOCK_SIZE = 100;
let BLOCK_BORDER = 4;

export class BlockView {
  view(vnode) {
    let block = vnode.attrs.block;
    return m("img", {
      src: block.texture,
      class: "crisp workspace-block noselect",
      onmousedown: function(event) {
        this.isDragged = true;
        this.dragStartMouseX = event.clientX;
        this.dragStartMouseY = event.clientY;
        this.dragStartBlockX = block.x;
        this.dragStartBlockY = block.y;
      },
      onmousemove: function(e) {
        if (this.isDragged) {
          let x = this.dragStartBlockX + (e.clientX - this.dragStartMouseX);
          let y = this.dragStartBlockY + (e.clientY - this.dragStartMouseY);
          block.move(x, y);
        }
      },
      onmouseup: function () {
        this.isDragged = false;
      },
      ondragstart: function() {
        return false;
      },
      style: "width: " + BLOCK_SIZE + "px; " + leftTop(block.x - BLOCK_BORDER, block.y - BLOCK_BORDER, BLOCK_SIZE, BLOCK_SIZE),
    });
  }
}
