package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketType
import totoro.ocelot.online.util.BinaryHelper

/**
  * Used as a response to failed request, with the fail description.
  *
  * Packet format:
  * Nb
  * <reason>
  */

class PacketFail extends Packet {
  override var packetType: Byte = PacketType.FAIL

  var reason: String = _

  def this(thread: Int, reason: String) {
    this()
    this.thread = thread
    this.reason = reason
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    BinaryHelper.encodeString(builder, reason)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    reason = BinaryHelper.decodeString(data)
    this
  }
}
