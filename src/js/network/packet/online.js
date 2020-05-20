import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let Online = {
  encode: function(thread, online) {
    let data = new DataView(new ArrayBuffer(Header.SIZE + 4));
    Header.encode(data, PacketTypes.ONLINE, thread);
    data.setUint32(Header.SIZE, online);
    return data;
  },

  // data: AdvancedDataView
  decode: function(data) {
    return data.getInt();
  }
};

export { Online };
