import { PacketTypes } from "../../const/packettypes.js";
import { Header } from "./header.js";

let UserDetails = {
  encode: function(thread, online) {},

  // data: AdvancedDataView
  decode: function(data) {
    let id = data.getInt();
    let nickname = data.getString(true);
    let email = data.getString(true);
    return { id: id, nickname: nickname, email: email };
  }
};

export { UserDetails };
