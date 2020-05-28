
// block structure will be:
// {
//   address: "xxx",  // component address related to this block (this way it would be easier to work with emulator backend)
//   x, y,            // coordinates (in pixels on workspace grid)
//   width, height,   // size of the block (in pixels)
//   textures: [      // collection of textures of which the block consists
//     { x, y, url, visible }, // each texture is positioned relative to the parent coordinates (in pixels)
//     ...
//   ],
//   wires: [],       // array of IDs of all wires, connected to the block
// }

export class Block {
  constructor(id, type, address, x, y) {
    this.id = id;
    this.type = type;
    this.address = address;
    this.x = x;
    this.y = y;
    this.textures = [];
    this.wires = [];
  }

  /**
   * Allows to use both Wire objects and just wire IDs as argument.
   */
  getId(wire) {
    if (typeof wire == "number") return wire;
    else return wire.id;
  }

  /**
   * Connects the Wire to this Block.
   * The same Wire cannot be connected to one block twice.
   *
   * NOTE: This method only modifies the Block object!
   *
   * @return: success of the operation
   */
  connect(wire) {
    let id = this.getId(wire);

    // this wire is already connected to this block
    if (this.wires.includes(id)) return false;

    // success
    this.wires.push(id);

    return true;
  }

  /**
   * Disconnects the Wire from this block.
   *
   * NOTE: this method only modifies the Block object.
   */
  disconnect(wire) {
    let id = this.getId(wire);
    let index = this.wires.indexOf(id);
    if (index > -1) {
      this.wires.splice(index, 1);
      return true;
    }
    return false;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}
