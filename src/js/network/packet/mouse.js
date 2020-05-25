import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";
import { AdvancedDataView } from "../dataview.js";

let Mouse = {
  encode: function(thread, id, x, y, nickname) {
    // 4 (id) + 4 (x) + 4 (y) + 2 (nickname len)
    let size = Header.SIZE + 14 + nickname.length;
    let data = new AdvancedDataView(new ArrayBuffer(size));
    Header.encode(data.data, PacketTypes.MOUSE, thread);
    data.setOffset(Header.SIZE);
    data.putInt(id);
    data.putInt(x);
    data.putInt(y);
    data.putString(nickname, true);
    return data.data;
  },

  // data: AdvancedDataView
  decode: function(data) {
    let id = data.getInt();
    let x = data.getInt();
    let y = data.getInt();
    let nickname = data.getString(true);
    return { id: id, x: x, y: y, nickname: nickname };
  }
};

export { Mouse };
