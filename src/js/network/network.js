import { PacketTypes } from "../const/packettypes.js";
import { GetOnline } from "./packet/get-online.js";
import { Online } from "./packet/online.js";
import { Mouse } from "./packet/mouse.js";
import { UserGetDetails } from "./packet/user-get-details.js";
import { UserDetails } from "./packet/user-details.js";
import { WorkspaceDescription } from "./packet/workspace-description.js";
import { WorkspaceState } from "./packet/workspace-state.js";
import { BlockMove } from "./packet/block-move.js";
import { BlockToggle } from "./packet/block-toggle.js";

import { AdvancedDataView } from "./dataview.js";

import { Workspace } from "../model/workspace.js";

import { state } from "../state.js";
import { Event, Bus } from "../event.js";

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
  if (state.debug) console.log("Sending: ", new Uint8Array(packet.buffer));
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
      if (state.debug) console.log("Incoming:", new Uint8Array(event.data));
      let data = new AdvancedDataView(event.data);
      // universal header of all ocelot packets
      // 1 byte: packet type, 4 bytes: thread ID (which may be 0000 if not used)
      let type = data.getByte();
      let thread = data.getInt();
      //
      switch (type) {
        case PacketTypes.ONLINE:
          let online = Online.decode(data);
          if (state.debug) console.log("People online: " + online);
          // update the DOM element
          let element = document.getElementById('online');
          if (element) element.innerHTML = online;
          //
          break;
        case PacketTypes.MOUSE:
          var packet = Mouse.decode(data);
          if (packet.id != state.user.id) {
            Bus.fire(Event.REMOTE_MOUSE_MOVE, packet);
          }
          break;
        case PacketTypes.WORKSPACE_LIST:
          state.workspace.list.value.length = 0;
          while (data.getRemaining() > 0) {
            state.workspace.list.value.push(WorkspaceDescription.decode(data));
          }
          state.workspace.list.loading = false;
          m.redraw();
          if (state.debug) console.log("Got new workspaces list: ", state.workspace.list.value);
          break;
        case PacketTypes.USER_DETAILS:
          state.user = UserDetails.decode(data);
          if (state.debug) console.log("Got user details: ", state.user);
          break;
        case PacketTypes.WORKSPACE_STATE:
          let workstate = WorkspaceState.decode(data);
          if (!state.workspace.current.value) {
            state.workspace.current.value = Workspace.from(workstate);
          } else {
            state.workspace.current.value.update(workstate);
          }
          state.workspace.current.loading = false;
          m.redraw();
          if (state.debug) console.log("Got new workspace state: ", state.workspace.current.value);
          break;
        case PacketTypes.BLOCK_MOVE:
          var workspace = state.workspace.current.value;
          if (workspace) {
            var packet = BlockMove.decode(data);
            if (!state.user || packet.thread != state.user.id) {
              workspace.moveBlock(packet.id, packet.x, packet.y);
              m.redraw();
            }
          }
          break;
        case PacketTypes.BLOCK_TOGGLE_FOLD: case PacketTypes.BLOCK_TOGGLE_POWER:
          var workspace = state.workspace.current.value;
          if (workspace) {
            var packet = BlockToggle.decode(data);
            if (!state.user || packet.thread != state.user.id) {
              if (type == PacketTypes.BLOCK_TOGGLE_FOLD) {
                workspace.foldBlock(packet.id, packet.flag);
              } else {
                workspace.turnOnBlock(packet.id, packet.flag);
              }
              m.redraw();
            }
          }
          break;
        default:
          if (state.debug) console.log("Incoming unparsed packet (type: " + type + "): " + event.data);
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
    send(UserGetDetails.encode(0, 0));
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
