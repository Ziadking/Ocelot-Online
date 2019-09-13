import { BuildingMenu, NavigationMenu } from "./menu.js";

var Layout = {
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
