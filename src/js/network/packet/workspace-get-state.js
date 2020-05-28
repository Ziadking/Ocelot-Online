import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let WorkspaceGetState = {
  encode: function(thread, id) {
    let data = new DataView(new ArrayBuffer(Header.SIZE + 4));
    Header.encode(data, PacketTypes.WORKSPACE_GET_STATE, thread | 0);
    data.setUint32(Header.SIZE, id);
    return data;
  },
  decode: function(data) {}
};

export { WorkspaceGetState };
