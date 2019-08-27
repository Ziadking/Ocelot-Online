import { state } from "../state.js"

export default {
  view: function () {
    var array = state.workspaces.map(function(workspace) {
      return m(".item", [workspace.name, m(".item-title", workspace.subtitle)]);
    });
    array.push(m(".item.create", ["+++", m(".item-title", "create new workspace")]));
    return array;
  },
}
