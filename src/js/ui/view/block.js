import { leftTop } from "../../util/helpers.js";

let BLOCK_SIZE = 100;

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
      style: "width: " + BLOCK_SIZE + "px; " + leftTop(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE),
    });
  }
}
