package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketType

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
  override var packetType: Byte = PacketType.USER_GET_DETAILS
}
