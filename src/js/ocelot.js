import { connect } from "./network/network.js";
import { Layout } from "./ui/layout.js";
import { WorkspaceListPage } from "./ui/page/workspace-list.js";
import { WorkspacePage } from "./ui/page/workspace.js";
import { LoginPage } from "./ui/page/login.js";
import { RegisterPage } from "./ui/page/register.js";
import { IntroPage } from "./ui/page/intro.js";

import { selectRightMenu } from "./ui/view/menu.js";

// init routing
m.route(document.body, "/workspace/0", {
  "/intro": {
    render: function(vnode) {
      selectRightMenu("home");
      return m(Layout, m(IntroPage))
    }
  },
  "/workspaces": {
    render: function() {
      selectRightMenu("workspaces");
      return m(Layout, m(WorkspaceListPage))
    }
  },
  "/workspace/:id": {
    render: function(vnode) {
      selectRightMenu("workspaces");
      return m(Layout, m(WorkspacePage, { id: vnode.attrs.id }))
    }
  },
  "/register": {
    render: function() {
      selectRightMenu("register");
      return m(Layout, m(RegisterPage))
    }
  },
  "/login": {
    render: function() {
      selectRightMenu("login");
      return m(Layout, m(LoginPage))
    }
  },
});

// init network
connect();
