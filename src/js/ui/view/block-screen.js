import { BlockView, BLOCK_SIZE } from "./block.js";
import { Terminal } from "./terminal.js";

export class BlockScreenView extends BlockView {
  constructor(vnode) {
    super(vnode);
    let block = vnode.attrs.block;
    block.addOverlay("on", "screen-on", true);
    this.turnedOn = true;
  }

  onContextMenu(event) {
    super.onContextMenu(event);
    if (this.folded && event.ctrlKey) {
      this.turnedOn = !this.turnedOn;
      this.block.overlays[0].visible = this.turnedOn;
    } else {
      this.folded = !this.folded;
    }
    if (this.folded) {
      this.width = BLOCK_SIZE;
      this.height = BLOCK_SIZE + 20;
    } else {
      this.width = 640;
      this.height = 420;
    }
  }

  /**
   * The interface of a screen unfolded
   */
  detailsInterface(vnode) {
    return [
      m(Terminal),
      m("div", { class: "address" }, this.block.address)
    ];
  }
}
