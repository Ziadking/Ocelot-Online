package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketType

/**
  * Request to delete user account (by user ID)
  *
  * No response is expected.
  *
  * Packet format:
  * 4b
  * <user-id>
  */

class PacketUserDelete extends PacketSingleID {
  override var packetType: Byte = PacketType.USER_DELETE
}
