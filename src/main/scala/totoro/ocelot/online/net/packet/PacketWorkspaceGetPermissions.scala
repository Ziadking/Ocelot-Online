package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketType

/**
  * Request for a list of workspace permissions (by workspace ID).
  *
  * Expected response: WORKSPACE_PERMISSONS or FAIL.
  *
  * Packet format:
  * 4b
  * <workspace-id>
  */

class PacketWorkspaceGetPermissions extends PacketSingleID {
  override var packetType: Byte = PacketType.WORKSPACE_GET_PERMISSIONS
}
