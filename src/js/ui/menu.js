class RightMenuItem {
  view(vnode) {
    return m("div", { class: "menu-item menu-item-right noselect" }, [
      m("div", { class: "menu-item-title" }, vnode.attrs.text),
      m("img", { class: "menu-item-icon", src: vnode.attrs.image }),
    ]);
  }
}

export class NavigationMenu {
  view() {
    return m("div", { class: "menu" }, [
      m(RightMenuItem, { text: "HOME", image: "images/icons/ocelot.png" }),
      m(RightMenuItem, { text: "WORKSPACES", image: "images/icons/workspaces.png" }),
      m(RightMenuItem, { text: "HELP", image: "images/icons/help.png" }),
      m(RightMenuItem, { text: "PROFILE", image: "images/icons/profile.png" }),
      m(RightMenuItem, { text: "LOGOUT", image: "images/icons/logout.png" }),
    ]);
  }
}

class LeftMenuItem {
  view(vnode) {
    return m("div", { class: "menu-item menu-item-left noselect" }, [
      m("img", { class: "menu-item-icon", src: vnode.attrs.image }),
      m("div", { class: "menu-item-title" }, vnode.attrs.text),
    ]);
  }
}

export class BuildingMenu {
  view() {
    return m("div", { class: "menu" }, [
      m(LeftMenuItem, { text: "BLOCKS", image: "images/icons/blocks.png" }),
      m(LeftMenuItem, { text: "PREFABS", image: "images/icons/prefabs.png" }),
    ]);
  }
}
