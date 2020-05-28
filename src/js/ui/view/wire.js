export class WireView {
  view(vnode) {
    let wire = vnode.attrs.wire;
    let parent = vnode.attrs.parent;
    return m("svg[width=" + wire.width + "][height=" + wire.height + "]",
      { class: "workspace-wire", style: { left: (parent.x + wire.x) + "px", top: (parent.y + wire.y) + "px" } },
      [ m("path[d=" + wire.path + "]") ]
    );
  }
}
