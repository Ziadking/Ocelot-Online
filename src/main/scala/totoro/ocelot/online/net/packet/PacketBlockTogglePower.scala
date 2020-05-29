package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

/**
  * Packet telling to turn the block on or off.
  *
  * Packet format:
  * 4b  1b
  * <id><flag>
  */

class PacketBlockTogglePower extends Packet {
  override var packetType: PacketType = PacketTypes.BLOCK_TOGGLE_POWER

  var id: Int = _
  var powered: Boolean = _

  def this(thread: Int, blockId: Int, powered: Boolean) {
    this()
    this.thread = thread
    this.id = blockId
    this.powered = powered
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putInt(id)
    builder.putByte(if (powered) 1 else 0)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    this.id = data.getInt()
    this.powered = data.get() == 1
    this
  }
}
