import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let GetOnline = {
  encode: function(thread) {
    let data = new DataView(new ArrayBuffer(Header.SIZE));
    Header.encode(data, PacketTypes.GET_ONLINE, thread | 0);
    return data;
  },

  // data: AdvancedDataView
  decode: function(data) {}
};

export { GetOnline };
