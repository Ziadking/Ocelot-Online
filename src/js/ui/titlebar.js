import Breadcrumbs from "./breadcrumbs.js"

export default {
  view: function() {
    return m("div", { id: "titlebar", class: "noselect" }, [
      m("div", { class: "nav-panel" }, [
        m(m.route.Link, { id: "title", class: "title", href: "/" }, "[ocelot.online]"),
        m(Breadcrumbs)
      ]),
      m("div", { class: "profile-panel" }, [
        m(m.route.Link, { id: "profile", class: "hidden", href: "/profile" }, "Profile"),
        m(m.route.Link, { id: "register", class: "button disabled", href: "/register" }, "[ register ]"),
        m(m.route.Link, { id: "login", class: "button", href: "/login" }, "[ login ]"),
      ])
    ])
  }
}
