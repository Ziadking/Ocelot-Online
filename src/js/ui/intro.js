export default class Intro {
  view(vnode) {
    return m("div", { id: "intro", class: "centered" }, [
      m("h2", "[ocelot.online]"),
      m("p", "OpenComputers emulator with 99% emulation accuracy."),
      m("p", [
        "A free collaborative workspace is available for experimenting.",
        m("br"),
        "And, of course, you can register an account and manage your own workspaces for something more serious."
      ]),
      m("p", "Please report anything that bothers you to the issue tracker, or just to me in IRC."),
      m("p", "I wish you a pleasant experience,"),
      m("p", "Totoro"),
    ]);
  }
}
