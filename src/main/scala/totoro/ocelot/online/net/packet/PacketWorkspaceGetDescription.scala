package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

/**
  * Request for workspace description (by ID).
  *
  * Expected response: WORKSPACE_DESCRIPTION or FAIL.
  *
  * Packet format:
  * 4b
  * <workspace-id>
  */

class PacketWorkspaceGetDescription extends PacketSingleID {
  override var packetType: PacketType = PacketTypes.WORKSPACE_GET_DESCRIPTION
}
