import { BlockView } from "./block.js";
import { Terminal } from "./terminal.js";

export class BlockScreenView extends BlockView {
  constructor(vnode) {
    super(vnode);
  }

  onContextMenu(event) {
    super.onContextMenu(event);
    if (this.folded && event.ctrlKey) {
      this.turnedOn = !this.turnedOn;
      this.block.textures[1].visible = this.turnedOn;
    } else {
      this.folded = !this.folded;
    }
    if (this.folded) {
      this.width = this.block.width;
      this.height = this.block.height;
    } else {
      this.width = 640;
      this.height = 400;
    }
  }

  /**
   * The interface of a screen unfolded
   */
  detailsInterface(vnode) {
    return [
      m(Terminal)
    ];
  }
}
