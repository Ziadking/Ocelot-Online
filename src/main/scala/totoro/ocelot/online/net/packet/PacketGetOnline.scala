package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

/**
  * Request for a number of people online.
  *
  * Expected response: ONLINE or FAIL.
  */

class PacketGetOnline extends Packet {
  override var packetType: PacketType = PacketTypes.GET_ONLINE
}
