import { leftTop } from "../../util/helpers.js";

export class Loader {
  view(vnode) {
    let visible = vnode.attrs.visible;
    return m("img", {
      class: "centered noselect lowlevel",
      style: "display: " + (visible ? "block" : "none"),
      src: "images/loader.svg",
      ondragstart: function() { return false; }
    });
  }
}
