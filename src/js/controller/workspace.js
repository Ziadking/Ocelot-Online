import { state } from "../state.js";
import { Workspace } from "../model/workspace.js";
import { Block } from "../model/block.js";
import { Wire } from "../model/wire.js";

let inited = false;

export function init() {
  if (!inited) {
    let workspace = new Workspace(0, "DEMO WORKSPACE", "free collaborative arena");
    let caseBlock = new Block("address1", -100, 0, "case");
    let screenBlock = new Block("address2", 100, 10, "screen");
    let wire = new Wire();
    wire.connect(caseBlock);
    wire.connect(screenBlock);
    wire.update();
    workspace.addBlock(caseBlock);
    workspace.addBlock(screenBlock);
    workspace.addWire(wire);

    state.workspace = {};
    state.workspace.all = [ workspace ];
    state.workspace.current = workspace;

    inited = true;
  }
}
