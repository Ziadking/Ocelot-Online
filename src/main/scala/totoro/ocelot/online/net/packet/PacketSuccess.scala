package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

class PacketSuccess extends Packet {
  override var packetType: PacketType = PacketTypes.SUCCESS
}
