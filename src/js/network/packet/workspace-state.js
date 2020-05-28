import { BlockTypes } from "../../const/blocktypes.js";
import { PacketTypes } from "../../const/packettypes.js";
import { TargetTypes } from "../../const/targettypes.js";

import { Header } from "./header.js";

let WorkspaceState = {
  encode: function(thread, online) {},

  // data: AdvancedDataView
  decode: function(data) {
    // get the description part
    let id = data.getInt();
    let name = data.getString(true);
    let description = data.getString(true);

    // get permissions
    let size = data.getInt();
    let permissions = new Array(size);
    for (let i = 0; i < size; i++) {
      permissions[i] = {};
      permissions[i].target = data.getByte();
      if (permissions[i].target == TargetTypes.USER) permissions[i].userId = data.getInt();
      permissions[i].flag = data.getInt();
    }

    // get blocks
    size = data.getInt();
    let blocks = new Array(size);
    for (let i = 0; i < size; i++) {
      // general block description
      blocks[i] = {};
      blocks[i].type = data.getByte();
      blocks[i].id = data.getInt();
      blocks[i].x = data.getInt();
      blocks[i].y = data.getInt();
      let hasAddress = data.getByte();
      if (hasAddress == 1) {
        blocks[i].address = data.getString(true);
      }
      // block-type dependent stuff
      if (blocks[i].type == BlockTypes.CASE || blocks[i].type == BlockTypes.SCREEN) {
        blocks[i].folded = data.getByte() == 1;
        blocks[i].turnedOn = data.getByte() == 1;
        blocks[i].tier = data.getByte();
      }
    }

    // get wires
    size = data.getInt();
    let wires = new Array(size);
    for (let i = 0; i < size; i++) {
      wires[i] = {};
      wires[i].id = data.getInt();
      wires[i].a = data.getInt();
      wires[i].b = data.getInt();
    }

    return { id: id, name: name, description: description, permissions: permissions, blocks: blocks, wires: wires };
  }
};

export { WorkspaceState };
