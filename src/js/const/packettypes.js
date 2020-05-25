/**
 * NOTE: Keep in sync with PacketTypes.scala!
 */

let PacketTypes = {
  // general
  SUCCESS: 0,
  FAIL: 1,

  GET_ONLINE: 2,
  ONLINE: 3,

  PING: 4,
  PONG: 5,

  MOUSE: 6,

  // users
  USER_GET_DETAILS: 15,
  USER_DETAILS: 16,

  // workspace
  WORKSPACE_GET_LIST: 25,
  WORKSPACE_LIST: 26,
  WORKSPACE_GET_STATE: 29,
  WORKSPACE_STATE: 30,
};

export { PacketTypes };
