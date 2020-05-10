package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

/**
  * Request for a list of workspace descriptions.
  *
  * Expected response: WORKSPACE_LIST or FAIL.
  */

class PacketWorkspaceGetList extends Packet {
  override var packetType: PacketType = PacketTypes.WORKSPACE_GET_LIST
}
