import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";
import { AdvancedDataView } from "../dataview.js";

let BlockMove = {
  encode: function(thread, id, x, y) {
    // 4 (id) + 4 (x) + 4 (y)
    let size = Header.SIZE + 12;
    let data = new AdvancedDataView(new ArrayBuffer(size));
    Header.encode(data.data, PacketTypes.BLOCK_MOVE, thread);
    data.setOffset(Header.SIZE);
    data.putInt(id);
    data.putInt(x);
    data.putInt(y);
    return data.data;
  },

  // data: AdvancedDataView
  decode: function(data) {
    let id = data.getInt();
    let x = data.getInt();
    let y = data.getInt();
    return { id: id, x: x, y: y };
  }
};

export { BlockMove };
