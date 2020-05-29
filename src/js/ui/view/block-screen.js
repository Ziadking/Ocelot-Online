import { BlockView } from "./block.js";
import { Terminal } from "./terminal.js";

import { PacketTypes } from "../../const/packettypes.js";
import { BlockToggle } from "../../network/packet/block-toggle.js";
import { send } from "../../network/network.js";

import { state } from "../../state.js";

export class BlockScreenView extends BlockView {
  constructor(vnode) {
    super(vnode);
  }

  getWidth() {
    return this.block.folded ? this.block.width : 640;
  }

  getHeight() {
    return this.block.folded ? this.block.height : 400;
  }

  onContextMenu(event) {
    super.onContextMenu(event);
    if (this.folded && event.ctrlKey) {
      this.block.turnedOn = !this.block.turnedOn;
      this.block.textures[1].visible = this.block.turnedOn;
      send(BlockToggle.encode(PacketTypes.BLOCK_TOGGLE_POWER, state.user ? state.user.id : 0, this.block.id, this.block.turnedOn));
    } else {
      this.block.folded = !this.block.folded;
      send(BlockToggle.encode(PacketTypes.BLOCK_TOGGLE_FOLD, state.user ? state.user.id : 0, this.block.id, this.block.folded));
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
