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
      m("div", { id: "nameplate" }, [
        m("a", { id: "version", href: "https://gitlab.com/cc-ru/ocelot/ocelot-online/blob/master/CHANGELOG.md" }, [
          "EAP: ", version
        ]),
        m("div", [
          "people online: ", m("span", { id: "online" }, 0)
        ]),
        m("a", { href: "https://webchat.esper.net/?join=cc.ru" }, "#cc.ru (c) 2020")
      ])
    ]
  }
}

export { Layout }
