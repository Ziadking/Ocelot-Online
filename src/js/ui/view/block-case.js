import { BlockView } from "./block.js";

export class BlockCaseView extends BlockView {
  constructor(vnode) {
    super(vnode);
    let block = vnode.attrs.block;
    block.addOverlay("on", "case-on", true);
    this.turnedOn = true;
  }

  onContextMenu(event) {
    super.onContextMenu(event);
    this.turnedOn = !this.turnedOn;
    this.block.overlays[0].visible = this.turnedOn;
  }
}
