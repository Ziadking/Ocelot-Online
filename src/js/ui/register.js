import { flash } from "../util/helpers.js";

export default class Register {
  view(vnode) {
    return m("div", { class: "login-form" }, [
      m("img", { class: "logo noselect", src: "favicon.png", ondragstart: function() { return false; } }),
      m(".header", "Username"),
      m("input"),
      m(".header", "E-mail"),
      m("input"),
      m(".header", "Password"),
      m("input"),
      m(".header", "Repeat password"),
      m("input"),
      m("button", { onclick: function() { flash(vnode.dom, false, true); } }, "Register"),
      m("p", [
        "Already have an account?",
        m("br"),
        "The you can just ",
        m(m.route.Link, { href: "/login" }, "login"),
        "."
      ]),
    ])
  }
}