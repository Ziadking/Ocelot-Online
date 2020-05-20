import { PacketTypes } from "../const/packettypes.js";
import { GetOnline } from "./packet/get_online.js";
import { Online } from "./packet/online.js";

import { AdvancedDataView } from "./dataview.js";

import { state } from "../state.js";

let threadId = 1;

export function newThreadId() {
  return threadId++;
}

let socket;
let connected = false;
let sendStack = []; // in case the network is not ready, all packet will be pushed in here

function reconnect() {
  console.log("[NETWORK] Reconnecting...");
  connect();
}

export function send(packet) {
  console.log("Sending: ", new Uint8Array(packet.buffer));
  if (connected) {
    socket.send(packet);
  } else {
    sendStack.push(packet);
  }
}

export function connect() {
  // open the connection
  if (host.endsWith("/")) host = host.substring(0, host.length - 1);
  socket = new WebSocket(host + "/stream");
  socket.binaryType = "arraybuffer";

  // subscribe to events
  socket.onmessage = function(event) {
    if (event.data instanceof ArrayBuffer) {
      console.log("[NETWORK] Incoming:", new Uint8Array(event.data));
      let data = new AdvancedDataView(event.data);
      // universal header of all ocelot packets
      // 1 byte: packet type, 4 bytes: thread ID (which may be 0000 if not used)
      let type = data.getByte();
      let thread = data.getInt();
      //
      switch (type) {
        case PacketTypes.ONLINE:
          let online = Online.decode(data);
          console.log("People online: " + online);
          let element = document.getElementById('online');
          if (element) element.innerHTML = online;
          break;
        case PacketTypes.WORKSPACE_LIST:
          state.workspace.list.value.length = 0;
          while (data.getRemaining() > 0) {
            let id = data.getInt();
            let name = data.getString(true);
            let description = data.getString(true);
            state.workspace.list.value.push({ id: id, name: name, description: description });
          }
          state.workspace.list.loading = false;
          console.log("Got new workspaces list: ", state.workspace.list.value);
          m.redraw();
          break;
        default:
          console.log("Incoming unparsed packet (type: " + type + "): " + event.data);
      }
    }
  }

  socket.onopen = function() {
    connected = true;
    console.log("[NETWORK] Succesfully connected.");
    // process caches requests
    sendStack.forEach(packet => send(packet));
    sendStack.length = 0;
    // init `people online` counter
    send(GetOnline.encode());
  };
  socket.onclose = function(event) {
    connected = false;
    console.error("[NETWORK] Websocket was closed.", event);
  };
  socket.onerror = function(error) {
    connected = false;
    console.error("[NETWORK] Some error observed: ", event);
    reconnect();
  };
}
