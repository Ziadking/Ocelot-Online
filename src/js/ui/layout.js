import { NavigationMenu } from "./view/menu.js";
import { init } from "../controller/window.js";

import { state } from "../state.js";

var Layout = {
  oninit: function() {
    init();
  },
  view: function(vnode) {
    let elements = [
      m("div", { id: "content", class: "fullscreen" }, vnode.children),
      m(NavigationMenu),
      m("div", { id: "nameplate" }, [
        m("a", { id: "version", href: "https://gitlab.com/cc-ru/ocelot/ocelot-online/blob/master/CHANGELOG.md" }, [
          "EAP: ", version
        ]),
        " / ",
        m("span", [
          "online: ", m("span", { id: "online" }, 0)
        ]),
        " / ",
        m("a", { href: "https://webchat.esper.net/?join=cc.ru" }, "#cc.ru (c) 2020")
      ])
    ]

    if (state.error) {
      elements.push(
        m("div", { class: "error centered" }, [
          m("div", { class: "top-bar" }),
          m("div", { class: "content" }, [
            m("div", { class: "title" }, [
              m("img", { class: "noselect icon", src: "images/warning.png" }),
              m("span", "ERROR")
            ]),
            m("div", { class: "text" }, state.error.text),
            m("div", { class: "buttons" }, state.error.buttons.map(button => m("button", { onclick: button.callback }, button.text)))
          ]),
          m("div", { class: "bottom-bar" })
        ])
      );
    }

    return elements;
  }
}

export { Layout }
