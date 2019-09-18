import { BuildingMenu, NavigationMenu } from "./view/menu.js";
import { init } from "../controller/window.js";

var Layout = {
  oninit: function() {
    init();
  },
  view: function(vnode) {
    return [
      m("div", { id: "container", class: "fullscreen" },
        m("div", { id: "content" }, vnode.children)
      ),
      m(BuildingMenu),
      m(NavigationMenu),
    ]
  }
}

export { Layout }
