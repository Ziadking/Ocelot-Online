package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

/**
  * Request for workspace state (by ID).
  *
  * Expected response: WORKSPACE_STATE or FAIL.
  *
  * Packet format:
  * 4b
  * <workspace-id>
  */

class PacketWorkspaceGetState extends PacketSingleID {
  override var packetType: PacketType = PacketTypes.WORKSPACE_GET_STATE
}
