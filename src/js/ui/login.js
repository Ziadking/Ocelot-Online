import { flash } from "../util/helpers.js";

export default class Login {
  view(vnode) {
    return m("div", { class: "login-form" }, [
      m("img", { class: "logo noselect", src: "images/logo.png", ondragstart: function() { return false; } }),
      m(".header", "Username"),
      m("input"),
      m(".header", "Password"),
      m("input", { type: "password" }),
      m("button", { onclick: function() { flash(vnode.dom, false, true); } }, "Login"),
      m("p", [
        "Do not have an account?",
        m("br"),
        "The you can just ",
        m(m.route.Link, { href: "/register" }, "register"),
        "."
      ]),
    ])
  }
}
