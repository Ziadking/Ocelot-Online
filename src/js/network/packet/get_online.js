import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let GetOnline = {
  encode: function(thread) {
    let data = new DataView(new ArrayBuffer(Header.SIZE));
    Header.encode(data, PacketTypes.GET_ONLINE, thread);
    return data;
  },
  decode: function(data) {}
};

export { GetOnline };
