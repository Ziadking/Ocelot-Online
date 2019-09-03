import { Layout } from "./ui/layout.js";
import Dashboard from "./ui/dashboard.js";
import Workspace from "./ui/workspace.js";
import Login from "./ui/login.js";
import Terminal from "./ui/terminal.js";

import { state } from "./state.js";

m.route(document.body, "/dash", {
  "/dash/:id": {
    render: function(vnode) {
      state.breadcrumbs = [ { text: "/ dashboard", url: "/dash" }, { text: "/ workspace", url: "/" + vnode.attrs.id } ]
      return m(Layout, m(Workspace, { id: vnode.attrs.id }))
    }
  },
  "/dash": {
    render: function() {
      state.breadcrumbs = [ { text: "/ dashboard", url: "/dash" }]
      return m(Layout, m(Dashboard))
    }
  },
  "/login": {
    render: function() {
      state.breadcrumbs = [ { text: "/ login", url: "/login" }]
      return m(Layout, m(Login))
    }
  },
});

//m.mount(document.body, Terminal);
