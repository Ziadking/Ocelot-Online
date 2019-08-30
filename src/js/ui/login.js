export default {
  view: function() {
    return m(".panel", { id: "login-form" }, [
      m("img", { class: "logo noselect", src: "images/logo.png", ondragstart: function() { return false; } }),
      m(".header", "Username"),
      m("input"),
      m(".header", "Password"),
      m("input"),
      m("button", "Enter")
    ])
  }
}
