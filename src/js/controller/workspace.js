import { state } from "../state.js";
import { Workspace } from "../model/workspace.js";
import { Block } from "../model/block.js";
import { Wire } from "../model/wire.js";
import { Entity } from "../const/entity.js";

let inited = false;

export function init() {
  // create demo workspace
  if (!inited) {
    let workspace = new Workspace(0, "DEMO WORKSPACE", "free collaborative arena");
    let caseBlock = new Block(Entity.CASE, "d163fbd7-4b34-4e22-85c7-4b4554713770", -100, -50, "case-t4");
    let screenBlock = new Block(Entity.SCREEN, "ac3635dc-6e85-474c-bcf1-ec8b8ef419b3", 100, -40, "screen-t2");
    let driveBlock = new Block(Entity.DRIVE, "dfd01a26-de2f-442f-bc62-6cdeed76a7c8", 50, 150, "drive");
    let wire1 = new Wire();
    wire1.connect(caseBlock);
    wire1.connect(screenBlock);
    wire1.update();
    workspace.addBlock(caseBlock);
    workspace.addBlock(screenBlock);
    workspace.addWire(wire1);
    let wire2 = new Wire();
    wire2.connect(caseBlock);
    wire2.connect(driveBlock);
    wire2.update();
    workspace.addBlock(driveBlock);
    workspace.addWire(wire2);

    state.workspace = {};
    state.workspace.all = [ workspace ];
    state.workspace.current = workspace;

    inited = true;
  }
}
