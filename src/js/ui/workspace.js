export default class Workspace {
  view(vnode) {
    return m("div", "Workspace #" + vnode.attrs.id);
  }
}
