import { state } from "../../state.js";
import { BlockView } from "../view/block.js";
import { WireView } from "../view/wire.js";

import { init } from "../../controller/workspace.js";

export class WorkspacePage {
  oninit() {
    init();
  }

  view(vnode) {
    let id = vnode.attrs.id;
    state.workspace.current = state.workspace.all.find(w => w.id == id);
    let elements = [];

    if (state.workspace.current != undefined) {
      // generate wires
      elements.push(
        Object.values(state.workspace.current.wires).map(wire => {
          return m(WireView, { wire: wire })
        })
      );

      // generate blocks
      elements.push(
        state.workspace.current.blocks.map(block => {
          return m(BlockView, { block: block });
        })
      );
    }

    return elements;
  }
}
