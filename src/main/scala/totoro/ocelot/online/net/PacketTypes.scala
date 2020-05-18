package totoro.ocelot.online.net

object PacketTypes {
  type PacketType = Byte

  // general
  val SUCCESS: Byte = 0
  val FAIL: Byte = 1
  val GET_ONLINE: Byte = 2
  val ONLINE: Byte = 3

  // user-related
  val REGISTER: Byte = 10
  val LOGIN: Byte = 11
  val USER_GET_DETAILS: Byte = 15
  val USER_DETAILS: Byte = 16
  val USER_DELETE: Byte = 17

  // workspace manipulation
  val WORKSPACE_CREATE: Byte = 20 // WORKSPACE_DESCRIPTION or FAIL is expected in response
  val WORKSPACE_RENAME: Byte = 21 // SUCCESS or FAIL
  val WORKSPACE_DELETE: Byte = 22 // SUCCESS or FAIL
  val WORKSPACE_GET_DESCRIPTION: Byte = 23
  val WORKSPACE_DESCRIPTION: Byte = 24 // workspace description containing the ID, name and author
  val WORKSPACE_GET_LIST: Byte = 25
  val WORKSPACE_LIST: Byte = 26        // list of descriptions
  val WORKSPACE_GET_PERMISSIONS: Byte = 27
  val WORKSPACE_PERMISSIONS: Byte = 28 // table of permissions
  val WORKSPACE_GET_STATE: Byte = 29
  val WORKSPACE_STATE: Byte = 30       // full model of workspace with list of blocks and wires and permissions

  val BLOCK_CREATE: Byte = 40 // expect BLOCK_STATE in return (or FAIL)
  val BLOCK_MOVE: Byte = 41
  val BLOCK_DELETE: Byte = 42
  val BLOCK_GET_STATE: Byte = 43
  val BLOCK_STATE: Byte = 44 // state is dependent on the block type, it may be just the address, or a screen matrix, etc.

  val WIRE_CREATE: Byte = 60 // expect WIRE_STATE in return (or FAIL)
  val WIRE_DELETE: Byte = 61
  val WIRE_STATE: Byte = 62 // will contain the ID of wire and all connected blocks

  val ITEM_CREATE: Byte = 70   // expect ITEM_STATE in return (or FAIL)
  val ITEM_DELETE: Byte = 71
  val ITEM_TRANSFER: Byte = 72 // move the item from one inventory to another
  val ITEM_STATE: Byte = 73    // depends on the type of the item
}
