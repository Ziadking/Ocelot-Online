/**
 * NOTE: Keep in sync with PacketTypes.scala!
 */

let PacketTypes = {
  // general
  SUCCESS: 0,
  FAIL: 1,
  GET_ONLINE: 2,
  ONLINE: 3,

  // workspace
  WORKSPACE_GET_LIST: 25,
  WORKSPACE_LIST: 26,
};

export { PacketTypes };
