import { connect } from "./network/network.js";
import { Layout } from "./ui/layout.js";
import { WorkspaceListPage } from "./ui/page/workspace-list.js";
import { WorkspacePage } from "./ui/page/workspace.js";
import { LoginPage } from "./ui/page/login.js";
import { RegisterPage } from "./ui/page/register.js";
import { IntroPage } from "./ui/page/intro.js";

import { selectMenuItem } from "./ui/view/menu.js";

// init routing
var root = document.getElementById("container");

m.route(root, "/workspace/0", {
  "/intro": {
    render: function(vnode) {
      selectMenuItem("home");
      return m(Layout, m(IntroPage))
    }
  },
  "/workspaces": {
    render: function() {
      selectMenuItem("workspaces");
      return m(Layout, m(WorkspaceListPage))
    }
  },
  "/workspace/:id": {
    render: function(vnode) {
      selectMenuItem("workspaces");
      return m(Layout, m(WorkspacePage, { id: vnode.attrs.id }))
    }
  },
  "/register": {
    render: function() {
      selectMenuItem("register");
      return m(Layout, m(RegisterPage))
    }
  },
  "/login": {
    render: function() {
      selectMenuItem("login");
      return m(Layout, m(LoginPage))
    }
  },
});

// init network
connect();
