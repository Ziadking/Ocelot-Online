let state = {
  right_selected: "home",
  left_selected: undefined
};

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
    return m("div", { class: "menu-item menu-item-right noselect", onclick: function () { state.right_selected = vnode.attrs.id; } }, [
      m(m.route.Link, { class: "menu-item-title", href: vnode.attrs.href }, vnode.attrs.text),
      m(MenuIcon, { icon: vnode.attrs.icon, selected: state.right_selected == vnode.attrs.id }),
    ]);
  }
}

export class NavigationMenu {
  view() {
    return m("div", { class: "menu" }, [
      m(RightMenuItem, { id: "home", text: "HOME", icon: "ocelot", href: "/" }),
      m(RightMenuItem, { id: "workspaces", text: "WORKSPACES", icon: "workspaces", href: "/workspaces" }),
      m(RightMenuItem, { id: "help", text: "HELP", icon: "help", href: "/help" }),
      m(RightMenuItem, { id: "profile", text: "PROFILE", icon: "profile", href: "/profile" }),
      m(RightMenuItem, { id: "logout", text: "LOGOUT", icon: "logout", href: "/logout" }),
    ]);
  }
}

class LeftMenuItem {
  view(vnode) {
    return m("div", {
      class: "menu-item menu-item-left noselect",
      onclick: function() {
        if (state.left_selected != vnode.attrs.id) state.left_selected = vnode.attrs.id;
        else state.left_selected = undefined;
      }
    }, [
      m(MenuIcon, { icon: vnode.attrs.icon, selected: state.left_selected == vnode.attrs.id }),
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
