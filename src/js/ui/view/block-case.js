import { BlockView } from "./block.js";

import { PacketTypes } from "../../const/packettypes.js";
import { BlockToggle } from "../../network/packet/block-toggle.js";
import { send } from "../../network/network.js";

import { state } from "../../state.js";

export class BlockCaseView extends BlockView {
  constructor(vnode) {
    super(vnode);
  }

  onContextMenu(event) {
    super.onContextMenu(event);
    this.block.turnedOn = !this.block.turnedOn;
    this.block.textures[1].visible = this.block.turnedOn;

    // notify backend
    send(BlockToggle.encode(PacketTypes.BLOCK_TOGGLE_POWER, state.user ? state.user.id : 0, this.block.id, this.block.turnedOn));
  }
}
