import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let WorkspaceDescription = {
  encode: function(thread, online) {},

  // data: AdvancedDataView
  decode: function(data) {
    let id = data.getInt();
    let name = data.getString(true);
    let description = data.getString(true);
    return { id: id, name: name, description: description };
  }
};

export { WorkspaceDescription };
