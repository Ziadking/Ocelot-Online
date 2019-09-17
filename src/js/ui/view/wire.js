import { leftTop } from "../../util/helpers.js";

export class WireView {
  view(vnode) {
    let wire = vnode.attrs.wire;
    return m("svg[width=" + wire.width + "][height=" + wire.height + "]",
      { class: "workspace-wire", style: leftTop(wire.x, wire.y, 0, 0) },
      [ m("path[d=" + wire.path + "]") ]
    );
  }
}
