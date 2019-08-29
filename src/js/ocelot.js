import { Layout } from "./ui/layout.js";
import Dashboard from "./ui/dashboard.js";
import Login from "./ui/login.js";

import Terminal from "./terminal/terminal.js";

// m.route(document.body, "/dash", {
//   "/dash": {
//     render: function() {
//       return m(Layout, m(Dashboard))
//     }
//   },
//   "/login": {
//     render: function() {
//       return m(Layout, m(Login))
//     }
//   }
// });

m.mount(document.body, Terminal);
