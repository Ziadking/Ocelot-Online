export default class Intro {
  view(vnode) {
    return m("div", { id: "intro", class: "centered" }, [
      m("h3", "[ocelot.online]"),
      m("p", "OpenComputers emulator with 99% emulation accuracy."),
      m("p", [
        "A free ",
        m(m.route.Link, { href: "/workspace/1"}, "collaborative workspace"),
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
        ", or just to me in ",
        m("a", { href: "https://webchat.esper.net/?join=cc.ru" }, "IRC"),
        "."
      ]),
      m("p", "I wish you a pleasant experience,"),
      m("p", "Totoro"),
    ]);
  }
}
