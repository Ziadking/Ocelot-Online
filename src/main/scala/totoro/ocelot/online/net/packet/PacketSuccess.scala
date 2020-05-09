package totoro.ocelot.online.net.packet

import totoro.ocelot.online.net.PacketType

class PacketSuccess extends Packet {
  override var packetType: Byte = PacketType.SUCCESS
}
