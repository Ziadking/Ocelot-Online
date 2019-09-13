import { state } from "../state.js"

export default {
  view: function () {
    var array = state.workspaces.map(function(workspace) {
      return m(".item .panel",
        { onclick: function() { m.route.set('/workspace/:id', { id: workspace.id }) } },
        [ workspace.name, m(".item-title", workspace.subtitle) ]
      );
    });
    if (state.loggedIn) array.push(m(".item.create .panel", ["+++", m(".item-title", "create new workspace")]));
    return array;
  },
}
