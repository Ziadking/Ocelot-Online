package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType

/**
  * Data packet with new coordinates for some block
  *
  * No response is expected.
  *
  * Packet format:
  * 4b  4b 4b
  * <id><x><y>
  */

class PacketBlockMove extends Packet {
  override var packetType: PacketType = PacketTypes.BLOCK_MOVE

  var id: Int = _
  var x: Int = _
  var y: Int = _

  def this(thread: Int, id: Int, x: Int, y: Int) {
    this()
    this.thread = thread
    this.id = id
    this.x = x
    this.y = y
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putInt(id)
    builder.putInt(x)
    builder.putInt(y)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    id = data.getInt()
    x = data.getInt()
    y = data.getInt()
    this
  }
}
