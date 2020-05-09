package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketType

/**
  * Request for a list of workspace descriptions.
  *
  * Expected response: WORKSPACE_LIST or FAIL.
  */

class PacketWorkspaceGetList extends Packet {
  override var packetType: Byte = PacketType.WORKSPACE_GET_LIST
}
