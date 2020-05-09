package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder

/**
  * Prefab for simple requests containing only an ID.
  *
  * Packet format:
  * 4b
  * <id>
  */

abstract class PacketSingleID extends Packet {
  var id: Int = _

  def this(thread: Int, id: Int) {
    this()
    this.thread = thread
    this.id = id
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putInt(id)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    id = data.getInt()
    this
  }
}
