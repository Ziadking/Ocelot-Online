import { BlockView } from "./block.js";

export class BlockCaseView extends BlockView {
  constructor(vnode) {
    super(vnode);
  }

  onContextMenu(event) {
    super.onContextMenu(event);
    this.block.turnedOn = !this.block.turnedOn;
    this.block.textures[1].visible = this.block.turnedOn;
  }
}
