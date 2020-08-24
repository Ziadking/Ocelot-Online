export class IntroPage {
  view(vnode) {
    return m("div", { id: "intro" }, [
      m("div", { id: "intro-header" }, [
        m("img", { class: "noselect", src: "images/logo.png", ondragstart: function() { return false; } }),
        m("div", { id: "intro-title" }, "[OCELOT.ONLINE]"),
        m("div", "advanced OpenComputers Emulator"),
      ]),
      m("div", { id: "intro-delimiter" }),
      m("div", { id: "intro-text" }, [
      m("p", "OpenComputers emulator with 99% emulation accuracy."),
        m("p", [
          "A free ",
          m(m.route.Link, { href: "/workspace/0"}, "collaborative workspace"),
          " is available for experimenting.",
          m("br"),
          "And, of course, you can ",
          m(m.route.Link, { href: "/register" }, "register"),
          " an account and manage your own ",
          m(m.route.Link, { href: "/workspaces" }, "workspaces"),
          " for something more serious."
        ]),
        m("p", [
          "Please report anything that bothers you to the ",
          m("a", { href: "https://gitlab.com/cc-ru/ocelot/ocelot-online/issues" }, "issue tracker"),
          ", or just to us in our ",
          m("a", { href: "https://webchat.esper.net/?join=cc.ru" }, "IRC channel"),
          "."
        ]),
        m("p", "We wish you a pleasant experience,"),
        m("p", "Ocelot Team"),
        m("img", { id: "signature", class: "noselect", src: "images/paw.png", ondragstart: function() { return false; } })
      ])
    ]);
  }
}
