package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketType

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
  override var packetType: Byte = PacketType.WORKSPACE_GET_STATE
}
