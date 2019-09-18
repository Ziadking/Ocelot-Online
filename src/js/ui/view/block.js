import { leftTop } from "../../util/helpers.js";

let BLOCK_SIZE = 100;
let BLOCK_BORDER = 4;

export class BlockView {
  view(vnode) {
    let block = vnode.attrs.block;
    return m("img", {
      src: block.texture,
      class: "crisp workspace-block noselect",
      ondragstart: function() {
        // TODO
        return false;
      },
      style: "width: " + BLOCK_SIZE + "px; " + leftTop(block.x - BLOCK_BORDER, block.y - BLOCK_BORDER, BLOCK_SIZE, BLOCK_SIZE),
    });
  }
}
