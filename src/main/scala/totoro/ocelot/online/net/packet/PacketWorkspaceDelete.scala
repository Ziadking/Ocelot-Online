package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

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
  override var packetType: PacketType = PacketTypes.WORKSPACE_DELETE
}
