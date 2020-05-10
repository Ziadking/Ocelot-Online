package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

/**
  * Request for user details by user ID.
  *
  * Expected response: USER_DETAILS or FAIL.
  *
  * Packet format:
  * 4b
  * <user-id>
  */

class PacketUserGetDetails extends PacketSingleID {
  override var packetType: PacketType = PacketTypes.USER_GET_DETAILS
}
