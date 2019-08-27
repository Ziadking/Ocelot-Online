import Layout from "./ui/layout.js";
import Dashboard from "./ui/dashboard.js";
import Login from "./ui/login.js";

m.route(document.body, "/dash", {
  "/dash": {
    render: function() {
      return m(Layout, m(Dashboard))
    }
  },
  "/login": {
    render: function() {
      return m(Layout, m(Login))
    }
  }
});
