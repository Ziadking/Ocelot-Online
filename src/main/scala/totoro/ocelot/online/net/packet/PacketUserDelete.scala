package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

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
  override var packetType: PacketType = PacketTypes.USER_DELETE
}
