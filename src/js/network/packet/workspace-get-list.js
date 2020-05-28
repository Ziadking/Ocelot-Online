import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let WorkspaceGetList = {
  encode: function(thread) {
    let data = new DataView(new ArrayBuffer(Header.SIZE));
    Header.encode(data, PacketTypes.WORKSPACE_GET_LIST, thread | 0);
    return data;
  },
  decode: function(data) {}
};

export { WorkspaceGetList };
