import { state } from "../state.js";
import { getWidth, getHeight } from "../util/helpers.js";

// state related stuff
/* ------------------------------------------------------------------------------------------------------------------ */

let MAX_BLOCKS = 1000;
let BLOCK_SIZE = 100;

function wireId(id1, id2) {
  if (id1 < id2) {
    return id1 * MAX_BLOCKS + id2;
  } else {
    return id2 * MAX_BLOCKS + id1;
  }
}

let inited = false;
function init() {
  if (!inited) {
    let workspace = {
      id: 0, name: "DEMO WORKSPACE", subtitle: "free collaborative arena",
      scheme: {
        blocks: [
          { id: 0, x: -100, y: 0, texture: "case" },
          { id: 1, x: 100, y: 10, texture: "screen" }
        ],
        wires: {}
      }
    };
    let wire = { id: wireId(0, 1), x: -100, y: 0, path: "M 5 5 C 55 0, 155 15, 205 15", width: 210, height: 20 };
    workspace.scheme.wires[wire.id] = wire;

    state.workspaces.push(workspace);

    inited = true;
  }
}


// graphics related stuff
/* ------------------------------------------------------------------------------------------------------------------ */

function lefttop(x, y, width, height) {
  let left = getWidth() / 2 + x - width / 2;
  let top = getHeight() / 2 + y - height / 2;
  return "left: " + left + "px; top: " + top + "px;";
}

class Wire {
  view(vnode) {
    let wire = vnode.attrs.wire;
    return m("svg[width=" + wire.width + "][height=" + wire.height + "]",
      { id: wire.id, class: "workspace-wire", style: lefttop(wire.x, wire.y, 0, 0) },
      [ m("path[d=" + wire.path + "]") ]
    );
  }
}

class Block {
  view(vnode) {
    let src = "images/textures/" + vnode.attrs.texture + ".png";
    return m("img", {
      src: src,
      class: "crisp workspace-block noselect",
      ondragstart: function() { return false; },
      style: "width: " + BLOCK_SIZE + "px; " + lefttop(vnode.attrs.x, vnode.attrs.y, BLOCK_SIZE, BLOCK_SIZE),
    });
  }
}

export default class Workspace {
  oninit() {
    init();
  }
  view(vnode) {
    let id = vnode.attrs.id;
    let workspace = state.workspaces.find(w => w.id == id);
    let elements = [];

    if (workspace != undefined) {
      // generate wires
      elements.push(
        Object.values(workspace.scheme.wires).map(wire => {
          return m(Wire, { wire: wire })
        })
      );

      // generate blocks
      elements.push(
        workspace.scheme.blocks.map(block => {
          return m(Block, { texture: block.texture, x: block.x, y: block.y });
        })
      );
    }

    return elements;
  }
}
