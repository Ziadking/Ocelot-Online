import { Loader } from "../view/loader.js";

import { state } from "../../state.js";
import { send } from "../../network/network.js";
import { WorkspaceGetList } from "../../network/packet/workspace_get_list.js";

export class WorkspaceListPage {
  oninit() {
    send(WorkspaceGetList.encode());
  }

  view() {
    var array = [ m(Loader, { visible: state.workspace.list.loading }) ];

    state.workspace.list.value.forEach(workspace =>
      array.push(m(".workspace-item",
        { onclick: function() { m.route.set('/workspace/:id', { id: workspace.id }) } },
        [ m(".workspace-item-title", workspace.name), m(".workspace-item-subtitle", workspace.description) ]
      ))
    );

    if (state.user) array.push(m(".item.create", [
      m(".workspace-item-title", "+++"), m(".workspace-item-subtitle", "create new workspace")
    ]));

    return array;
  }
}
