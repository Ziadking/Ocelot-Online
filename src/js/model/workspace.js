
// workspace structure:
// {
//   id, name, subtitle,
//   blocks: [],      // array of all blocks
//   blocksIndex: {}, // index with `address -> block` pairs, where `block` is a reference to `blocks` array object
//   wires: [],       // array of all wires
// }

export class Workspace {
  constructor(id, name, subtitle) {
    this.id = id;
    this.name = name;
    this.subtitle = subtitle;
    this.blocks = [];
    this.wires = [];
  }

  addBlock(block) {
    this.blocks.push(block);
  }

  removeBlock(block) {
    let index = this.blocks.indexOf(block);
    if (index > -1) this.blocks.splice(index, 1);
  }

  addWire(wire) {
    this.wires.push(wire);
  }

  removeWire(wire) {
    let index = this.wires.indexOf(wire);
    if (index > -1) this.wires.splice(index, 1);
  }
}
