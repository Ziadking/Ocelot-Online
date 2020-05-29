import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";
import { AdvancedDataView } from "../dataview.js";

let BlockToggle = {
  encode: function(type, thread, id, flag) {
    // 4 (id) + 1 (flag)
    let size = Header.SIZE + 5;
    let data = new AdvancedDataView(new ArrayBuffer(size));
    Header.encode(data.data, type, thread);
    data.setOffset(Header.SIZE);
    data.putInt(id);
    data.putByte(flag ? 1 : 0);
    return data.data;
  },

  // data: AdvancedDataView
  decode: function(data) {
    let id = data.getInt();
    let flag = data.getByte() == 1;
    return { id: id, flag: flag };
  }
};

export { BlockToggle };
