/**
 * This structure serves as a singleton state object,
 * shared between pages and views of the Ocelot app
 */

var state = {
  debug: false,
  user: undefined,
  mouseX: 0, mouseY: 0, // these coordinates will be used to locate the free end of new wires, for example
  workspace: {
    // list of workspace descriptions
    list: {
      loading: true,
      value: []
    },
    // visual model of the current workspace
    // (this model is build based on the full workspace state packet received from websocket)
    current: {
      loading: true,
      value: undefined
    }
  },
  menu: undefined, // ID of selected navigation menu item
  error: undefined // { text: "...", buttons: [ { text: "...", callback: f() } ] }
};

export { state };
