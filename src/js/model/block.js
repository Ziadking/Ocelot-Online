
// block structure will be:
// {
//   address: "xxx",  // component address related to this block (this way it would be easier to work with emulator backend)
//   x, y,            // coordinates
//   texture: "...",  // filename of texture
//   wires: [],       // array of all wires, connected to the block (as references to a `workspace.wires` array element)
// }

export class Block {
  constructor(entity, address, x, y, texture, overlays) {
    this.entity = entity;
    this.address = address;
    this.x = x;
    this.y = y;
    this.texture = "images/textures/" + texture + ".png";
    this.overlays = overlays;
    if (this.overlays) {
      this.overlays.map(overlay => overlay.texture = "images/textures/" + overlay.texture + ".png");
    }
    this.wires = [];
  }

  addOverlay(id, texture, visible) {
    if (!this.overlays) this.overlays = [];
    this.overlays.push({ id: id, texture: "images/textures/" + texture + ".png", visible: visible });
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    // now we need to update all connected wires
    this.wires.forEach(wire => wire.update());
  }
}
