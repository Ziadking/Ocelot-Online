
// block structure will be:
// {
//   address: "xxx",  // component address related to this block (this way it would be easier to work with emulator backend)
//   x, y,            // coordinates
//   texture: "...",  // filename of texture
//   wires: [],       // array of all wires, connected to the block (as references to a `workspace.wires` array element)
// }

export class Block {
  constructor(address, x, y, texture) {
    this.address = address;
    this.x = x;
    this.y = y;
    this.texture = "images/textures/" + texture + ".png";
    this.wires = [];
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    // now we need to update all connected wires
    this.wires.forEach(wire => wire.update());
  }
}
