import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let Online = {
  // actually I'm not sure we need this `encode` implementation here
  // the `online` package is purely `server -> client`
  // will leave it as an example
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
