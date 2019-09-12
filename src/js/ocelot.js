import { Layout } from "./ui/layout.js";
import Dashboard from "./ui/dashboard.js";
import Workspace from "./ui/workspace.js";
import Login from "./ui/login.js";
import Intro from "./ui/intro.js";

import { state } from "./state.js";

m.route(document.body, "/intro", {
  "/intro": {
    render: function(vnode) {
      return m(Layout, m(Intro))
    }
  },
  "/dash/:id": {
    render: function(vnode) {
      return m(Layout, m(Workspace, { id: vnode.attrs.id }))
    }
  },
  "/dash": {
    render: function() {
      return m(Layout, m(Dashboard))
    }
  },
  "/login": {
    render: function() {
      return m(Layout, m(Login))
    }
  },
});
