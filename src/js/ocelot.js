import { Layout } from "./ui/layout.js";
import WorkspaceList from "./ui/workspace-list.js";
import Workspace from "./ui/workspace.js";
import Login from "./ui/login.js";
import Register from "./ui/register.js";
import Intro from "./ui/intro.js";

import { selectRightMenu } from "./ui/menu.js";

import { state } from "./state.js";

m.route(document.body, "/intro", {
  "/intro": {
    render: function(vnode) {
      selectRightMenu("home");
      return m(Layout, m(Intro))
    }
  },
  "/workspaces": {
    render: function() {
      selectRightMenu("workspaces");
      return m(Layout, m(WorkspaceList))
    }
  },
  "/workspace/:id": {
    render: function(vnode) {
      selectRightMenu("workspaces");
      return m(Layout, m(Workspace, { id: vnode.attrs.id }))
    }
  },
  "/register": {
    render: function() {
      selectRightMenu("register");
      return m(Layout, m(Register))
    }
  },
  "/login": {
    render: function() {
      selectRightMenu("login");
      return m(Layout, m(Login))
    }
  },
});
