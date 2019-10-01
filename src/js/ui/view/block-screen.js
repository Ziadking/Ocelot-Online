import { BlockView } from "./block.js";

export class BlockScreenView extends BlockView {
  constructor(vnode) {
    super(vnode);
    let block = vnode.attrs.block;
    block.addOverlay("on", "screen-on", true);
    this.turnedOn = true;
  }

  onContextMenu(event) {
    super.onContextMenu(event);
    this.turnedOn = !this.turnedOn;
    this.block.overlays[0].visible = this.turnedOn;
  }
}
