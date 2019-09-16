import { state } from "../state.js"

export function selectRightMenu(id) {
  state.menu.right = id
}

export function selectLeftMenu(id) {
  state.menu.left = id
}

class MenuIcon {
  view(vnode) {
    let filename = vnode.attrs.icon;
    let selected = vnode.attrs.selected;
    if (selected) {
      let img = "images/icons/" + filename + ".png";
      let img_w = "images/icons/" + filename + "-w.png";
      return [
        m("img", { class: "menu-item-icon menu-icon-default", src: img, ondragstart: function() { return false; } }),
        m("img", { class: "menu-item-icon menu-icon-hover", src: img_w, ondragstart: function() { return false; } }),
      ];
    } else {
      let img_o = "images/icons/" + filename + "-o.png";
      let img_wo = "images/icons/" + filename + "-wo.png";
      return [
        m("img", { class: "menu-item-icon menu-icon-default", src: img_o, ondragstart: function() { return false; } }),
        m("img", { class: "menu-item-icon menu-icon-hover", src: img_wo, ondragstart: function() { return false; } }),
      ];
    }
  }
}

class RightMenuItem {
  view(vnode) {
    return m(m.route.Link, {
      class: "menu-item menu-item-right noselect",
      onclick: function () { state.menu.right = vnode.attrs.id; },
      href: vnode.attrs.href,
    }, [
      m("div", { class: "menu-item-title" }, vnode.attrs.text),
      m(MenuIcon, { icon: vnode.attrs.icon, selected: state.menu.right == vnode.attrs.id }),
    ]);
  }
}

export class NavigationMenu {
  oninit() {
    if (!state.menu.right) state.menu.right = "home";
  }
  view() {
    let items = [
      m(RightMenuItem, { id: "home", text: "HOME", icon: "ocelot", href: "/" }),
      m(RightMenuItem, { id: "workspaces", text: "WORKSPACES", icon: "workspaces", href: "/workspaces" }),
      m(RightMenuItem, { id: "help", text: "HELP", icon: "help", href: "/help" }),
    ];
    if (state.loggedIn) {
      items.push(m(RightMenuItem, { id: "profile", text: "PROFILE", icon: "profile", href: "/profile" }));
      items.push(m(RightMenuItem, { id: "logout", text: "LOGOUT", icon: "logout", href: "/logout" }));
    } else {
      items.push(m(RightMenuItem, { id: "register", text: "REGISTER", icon: "register", href: "/register" }));
      items.push(m(RightMenuItem, { id: "login", text: "LOGIN", icon: "login", href: "/login" }));
    }
    return m("div", { class: "menu" }, items);
  }
}

class LeftMenuItem {
  view(vnode) {
    return m("div", {
      class: "menu-item menu-item-left noselect",
      onclick: function() {
        if (state.menu.left != vnode.attrs.id) state.menu.left = vnode.attrs.id;
        else state.menu.left = undefined;
      }
    }, [
      m(MenuIcon, { icon: vnode.attrs.icon, selected: state.menu.left == vnode.attrs.id }),
      m("div", { class: "menu-item-title" }, vnode.attrs.text),
    ]);
  }
}

export class BuildingMenu {
  view() {
    return m("div", { class: "menu" }, [
      m(LeftMenuItem, { id: "blocks", text: "BLOCKS", icon: "blocks" }),
      m(LeftMenuItem, { id: "prefabs", text: "PREFABS", icon: "prefabs" }),
    ]);
  }
}
