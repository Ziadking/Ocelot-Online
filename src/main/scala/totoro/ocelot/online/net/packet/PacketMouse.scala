package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType
import totoro.ocelot.online.util.BinaryHelper

/**
  * Data packet with coordinates of user mouse on workspace plane.
  *
  * No response is expected.
  *
  * Packet format:
  * 4b       4b 4b 2b            Xb
  * <user-id><x><y><nickname-len><nickname>
  */

class PacketMouse extends Packet {
  override var packetType: PacketType = PacketTypes.MOUSE

  var id: Int = _
  var x: Int = _
  var y: Int = _
  var nickname: String = _

  def this(thread: Int, id: Int, x: Int, y: Int, nickname: String) {
    this()
    this.thread = thread
    this.id = id
    this.x = x
    this.y = y
    this.nickname = nickname
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putInt(id)
    builder.putInt(x)
    builder.putInt(y)
    BinaryHelper.encodeString(builder, nickname, withLen = true)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    id = data.getInt()
    x = data.getInt()
    y = data.getInt()
    nickname = BinaryHelper.decodeString(data, withLen = true)
    this
  }
}
