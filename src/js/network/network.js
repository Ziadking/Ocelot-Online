import { PacketTypes } from "../const/packettypes.js";
import { GetOnline } from "./packet/get_online.js";
import { Online } from "./packet/online.js";

let threadId = 1;

export function newThreadId() {
  return threadId++;
}

let socket;

function reconnect() {
  console.log("[NETWORK] Reconnecting...");
  connect();
}

export function send(packet) {
  socket.send(packet);
}

export function connect() {
  // open the connection
  if (host.endsWith("/")) host = host.substring(0, host.length - 1);
  socket = new WebSocket(host + "/stream");
  socket.binaryType = "arraybuffer";

  // subscribe to events
  socket.onmessage = function(event) {
    if (event.data instanceof ArrayBuffer) {
      console.log("[NETWORK] Incoming:", event.data);
      let data = new DataView(event.data);
      // universal header of all ocelot packets
      // 1 byte: packet type, 4 bytes: thread ID (which may be 0000 if not used)
      let type = data.getUint8(0);
      let thread = data.getUint32(1);
      //
      switch (type) {
        case PacketTypes.ONLINE:
          let online = Online.decode(data);
          console.log("People online: " + online);
          document.getElementById('online').innerHTML = online;
          break;
        default:
          console.log("Incoming unparsed packet: " + array);
      }
    }
  }

  socket.onopen = function() {
    console.log("[NETWORK] Succesfully connected.");
    send(GetOnline.encode(0));
  };
  socket.onclose = function(event) {
    console.error("[NETWORK] Websocket was closed.", event);
  };
  socket.onerror = function(error) {
    console.error("[NETWORK] Some error observed: ", event);
    reconnect();
  };
}
