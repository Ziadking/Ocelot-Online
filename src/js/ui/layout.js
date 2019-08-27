import TitleBar from "./titlebar.js";

var Layout = {
  view: function(vnode) {
    return [
      m("img", {
        id: "watermark", class: "centered noselect", src: "images/watermark.png",
        ondragstart: function() { return false; }
      }),
      m(TitleBar),
      m("div", { id: "container" }, vnode.children)
    ]
  }
}

export { Layout }
