package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketType

/**
  * Request to delete a workspace (by its ID).
  *
  * No response is expected.
  *
  * Packet format:
  * 4b
  * <workspace-id>
  */

class PacketWorkspaceDelete extends PacketSingleID {
  override var packetType: Byte = PacketType.WORKSPACE_DELETE
}
