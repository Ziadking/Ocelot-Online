package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketType

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
  override var packetType: Byte = PacketType.WORKSPACE_GET_DESCRIPTION
}
