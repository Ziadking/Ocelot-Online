import { state } from "../state.js"

export default {
  view: function () {
    var array = state.workspaces.map(function(workspace) {
      return m(".workspace-item",
        { onclick: function() { m.route.set('/workspace/:id', { id: workspace.id }) } },
        [ m(".workspace-item-title", workspace.name), m(".workspace-item-subtitle", workspace.subtitle) ]
      );
    });
    if (state.loggedIn) array.push(m(".item.create", [
      m(".workspace-item-title", "+++"), m(".workspace-item-subtitle", "create new workspace")
    ]));
    return array;
  },
}
