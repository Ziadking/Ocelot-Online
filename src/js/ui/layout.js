import { BuildingMenu, NavigationMenu } from "./menu.js";

var Layout = {
  view: function(vnode) {
    return [
      m("img", {
        id: "watermark", class: "centered noselect", src: "images/watermark.png",
        ondragstart: function() { return false; }
      }),
      m("div", { id: "container", class: "fullscreen" }, vnode.children),
      m(BuildingMenu),
      m(NavigationMenu),
    ]
  }
}

export { Layout }
