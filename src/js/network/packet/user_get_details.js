import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let UserGetDetails = {
  encode: function(thread, userId) {
    let data = new DataView(new ArrayBuffer(Header.SIZE + 4));
    Header.encode(data, PacketTypes.USER_GET_DETAILS, thread | 0);
    data.setUint32(Header.SIZE, userId);
    return data;
  },
  decode: function(data) {}
};

export { UserGetDetails };
