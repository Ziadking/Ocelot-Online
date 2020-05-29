import { BlockTypes } from "../const/blocktypes.js";
import { Textures } from "../const/textures.js";

import { Block } from "./block.js";
import { Wire } from "./wire.js";

import { state } from "../state.js";

// workspace structure:
// {
//   id, name, description,
//   blocks: {},      // map of all blocks (id -> block)
//   wires: {},       // map of all wires (id -> wire)
//   permissions      // TODO
// }

export class Workspace {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.blocks = {};
    this.wires = {};
  }

  /**
   * Creates a new instance of Workspace based on the WorkspaceState packet data.
   */
  static from(data) {
    let workspace = new Workspace(data.id, data.name, data.description);
    workspace.update(data);
    return workspace;
  }

  /**
   * Updates this workspace based on the WorkspaceState packet data.
   *
   * We suppose that the elements with the same ID are the same elements (possibly modified).
   * So they can not suddenly change, for example, the block type, or the block size.
   */
  update(data) {
    // blocks
    data.blocks.forEach(block => {
      let blockModel = this.blocks[block.id];

      // update general data
      if (blockModel) {
        blockModel.setPosition(block.x, block.y);
        blockModel.address = block.address;
      } else {
        blockModel = new Block(block.id, block.type, block.address, block.x, block.y);
        blockModel.width = 128;
        blockModel.height = 128;
        switch(block.type) {
          case BlockTypes.CASE:
            blockModel.textures.push({ x: 0, y: 0, url: Textures.CASE[block.tier], visible: true });
            blockModel.textures.push({ x: 0, y: 0, url: Textures.CASE_ON, visible: block.turnedOn });
            blockModel.textures.push({ x: 0, y: 0, url: Textures.CASE_ACTIVITY, visible: false });
            blockModel.textures.push({ x: 0, y: 0, url: Textures.CASE_ERROR, visible: false });
            break;
          case BlockTypes.SCREEN:
            blockModel.textures.push({ x: 0, y: 0, url: Textures.SCREEN[block.tier], visible: true });
            blockModel.textures.push({ x: 0, y: 0, url: Textures.SCREEN_ON, visible: block.turnedOn });
            break;
        }
        this.addBlock(blockModel);
      }

      // update block-specific data (later this part may be refactored to the specific block implementations)
      if (block.type == BlockTypes.CASE || block.type == BlockTypes.SCREEN) {
        blockModel.folded = block.folded;
        blockModel.turnedOn = block.turnedOn;
      }

      // detach all wires
      blockModel.wires.length = 0;

      // mark the block model as "updated", so later we can remove all "not updated" ones
      blockModel.updated = true;
    });

    for (let [key, value] of Object.entries(this.blocks)) {
      if (value.updated) value.updated = false;
      else delete this.blocks[key];
    }

    // wires
    data.wires.forEach(wire => {
      let wireModel = this.wires[wire.id];

      if (!wireModel) {
        wireModel = new Wire(wire.id);
        this.addWire(wireModel);
      }

      wireModel.a = wire.a;
      wireModel.b = wire.b;

      let blockModelA = wire.a ? this.blocks[wire.a] : undefined;
      let blockModelB = wire.b ? this.blocks[wire.b] : undefined;
      if (blockModelA) this.connect(blockModelA, wireModel);
      if (blockModelB) this.connect(blockModelB, wireModel);
      if (blockModelA && blockModelB) {
        wireModel.update(blockModelA.x, blockModelA.y, blockModelB.x, blockModelB.y, false);
      }

      wireModel.updated = true;
    });

    for (let [key, value] of Object.entries(this.wires)) {
      if (value.updated) value.updated = false;
      else delete this.wires[key];
    }
  }


  getId(something) {
    if (typeof something == "number") return something;
    else return something.id;
  }

  /**
   * @param block: a Block instance
   */
  addBlock(block) {
    this.blocks[block.id] = block;
  }

  moveBlock(block, x, y) {
    let id = this.getId(block);
    if (this.blocks[id]) {
      // move the block
      this.blocks[id].setPosition(x, y);
      // update all connected wires
      this.blocks[id].wires.forEach(id => {
        let wire = this.wires[id];
        if (wire) {
          let a = wire.a ? this.blocks[wire.a] : undefined;
          let b = wire.b ? this.blocks[wire.b] : undefined;
          wire.update(a ? a.x : state.mouseX, a ? a.y : state.mouseY, b ? b.x : state.mouseX + 20, b ? b.y : state.mouseY + 20);
        }
      });
    }
  }

  foldBlock(block, flag) {
    let id = this.getId(block);
    if (this.blocks[id]) {
      if (this.blocks[id].type == BlockTypes.CASE || this.blocks[id].type == BlockTypes.SCREEN) {
        this.blocks[id].folded = flag;
      }
    }
  }

  turnOnBlock(block, flag) {
    let id = this.getId(block);
    if (this.blocks[id]) {
      if (this.blocks[id].type == BlockTypes.CASE || this.blocks[id].type == BlockTypes.SCREEN) {
        this.blocks[id].turnedOn = flag;
        this.blocks[id].textures[1].visible = flag;
      }
    }
  }

  /**
   * @param block: can be either a Block instance or a block ID
   */
  removeBlock(block) {
    let id = this.getId(block);
    delete this.blocks[id];
  }

  /**
   * @param wire: a Wire instance
   */
  addWire(wire) {
    this.wires[wire.id] = wire;
  }

  /**
   * @param wire: can be either a Wire instance or a wire ID
   */
  removeWire(wire) {
    let id = this.getId(wire);
    delete this.wires[id];
  }

  /**
   * Try to connect the wire to the block.
   * @return: result of the operation.
   */
  connect(block, wire) {
    let result = block.connect(wire);
    if (!result) return false;

    result = wire.connect(block);
    if (!result) {
      block.disconnect(wire);
      return false;
    }

    return true;
  }

  /**
   * Try to disconnect the wire from the block.
   * @return: result of the operation.
   */
  disconnect(block, wire) {
    wire.disconnect(block);
    block.disconnect(wire);
    return true;
  }
}
