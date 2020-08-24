import { state } from "../../state.js"

export function selectMenuItem(id) {
  state.menu = id;
}

class MenuItem {
  view(vnode) {
    let id = vnode.attrs.id;
    let icon = vnode.attrs.icon;
    let hint = vnode.attrs.hint;

    return m("div", { class: "menu-item noselect" + (state.menu == id ? " menu-item-selected" : ""), ondragstart: function() { return false; } },
      m(m.route.Link, { href: vnode.attrs.href },
        m("img", { src: "images/icons/" + icon + ".png" })
      )
    );
  }
}

export class NavigationMenu {
  oninit() {
    if (!state.menu) state.menu = "home";
  }
  view() {
    let items = [
      m(MenuItem, { id: "home", hint: "home", icon: "ocelot", href: "/" }),
      m(MenuItem, { id: "workspaces", hint: "workspaces", icon: "workspaces", href: "/workspaces" }),
      m(MenuItem, { id: "help", hint: "help", icon: "help", href: "/intro" }),
    ];
    if (state.loggedIn) {
      items.push(m(MenuItem, { id: "profile", hint: "profile", icon: "profile", href: "/profile" }));
      items.push(m(MenuItem, { id: "logout", hint: "logout", icon: "logout", href: "/logout" }));
    } else {
      items.push(m(MenuItem, { id: "register", hint: "register", icon: "register", href: "/register" }));
      items.push(m(MenuItem, { id: "login", hint: "login", icon: "login", href: "/login" }));
    }
    return m("div", { class: "menu" }, items);
  }
}
