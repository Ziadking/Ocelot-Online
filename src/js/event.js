/**
 * Makeshift event bus
 * Any part of the project can leave it's subscrptions here.
 * Any part can check the subscriptions of others.
 * Any part can fire some events.
 */

let Event = {
  LOCAL_MOUSE_MOVE: 0,
  LOCAL_MOUSE_DOWN: 1,
  LOCAL_MOUSE_UP: 2,

  REMOTE_MOUSE_MOVE: 10,
};

let Bus = {
  /**
   * Registered subscriptions.
   * The format is the following:
   * {
   *   "event": {
   *     "requester": callback,
   *     ...
   *   },
   *   ...
   * }
   */
  subs: {},
  /**
   * Add some call-back to be called when the "event" happens.
   * The event
   */
  sub(requester, event, callback) {
    if (Bus.subs[event] == undefined) Bus.subs[event] = {};
    Bus.subs[event][requester] = callback;
  },
  unsub(requester, event) {
    if (Bus.subs[event] != undefined) {
      delete Bus.subs[event][requester];
    }
  },
  fire(event, data) {
    if (Bus.subs[event] != undefined) {
      Object.values(Bus.subs[event]).forEach(callback => callback(data));
    }
  }
};

export { Event, Bus };
