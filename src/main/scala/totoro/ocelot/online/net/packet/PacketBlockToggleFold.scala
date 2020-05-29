package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

/**
  * Packet telling to fold or unfold the block.
  *
  * Packet format:
  * 4b  1b
  * <id><flag>
  */

class PacketBlockToggleFold extends Packet {
  override var packetType: PacketType = PacketTypes.BLOCK_TOGGLE_FOLD

  var id: Int = _
  var folded: Boolean = _

  def this(thread: Int, blockId: Int, folded: Boolean) {
    this()
    this.thread = thread
    this.id = blockId
    this.folded = folded
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putInt(id)
    builder.putByte(if (folded) 1 else 0)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    this.id = data.getInt()
    this.folded = data.get() == 1
    this
  }
}
