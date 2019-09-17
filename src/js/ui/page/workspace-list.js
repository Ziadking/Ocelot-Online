import { state } from "../../state.js";
import { init } from "../../controller/workspace.js";

export class WorkspaceListPage {
  oninit() {
    init();
  }

  view() {
    var array = state.workspace.all.map(workspace =>
      m(".workspace-item",
        { onclick: function() { m.route.set('/workspace/:id', { id: workspace.id }) } },
        [ m(".workspace-item-title", workspace.name), m(".workspace-item-subtitle", workspace.subtitle) ]
      )
    );
    if (state.user) array.push(m(".item.create", [
      m(".workspace-item-title", "+++"), m(".workspace-item-subtitle", "create new workspace")
    ]));
    return array;
  }
}
