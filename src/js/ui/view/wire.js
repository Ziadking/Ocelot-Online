import { leftTop } from "../../util/helpers.js";

export class WireView {
  view(vnode) {
    let wire = vnode.attrs.wire;
    let parent = vnode.attrs.parent;
    return m("svg[width=" + wire.width + "][height=" + wire.height + "]",
      { class: "workspace-wire", style: leftTop(parent.x + wire.x, parent.y + wire.y, 0, 0) },
      [ m("path[d=" + wire.path + "]") ]
    );
  }
}
