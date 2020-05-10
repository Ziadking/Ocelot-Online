package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType
import totoro.ocelot.online.util.BinaryHelper

/**
  * Data packet with [[totoro.ocelot.online.user.User]] details.
  *
  * No response is expected.
  *
  * Packet format:
  * 4b       2b            Xb        2b         Yb
  * <user-id><nickname-len><nickname><email-len><email>
  */

class PacketUserDetails extends Packet {
  override var packetType: PacketType = PacketTypes.USER_DETAILS

  var id: Int = _
  var nickname: String = _
  var email: String = _

  def this(thread: Int, id: Int, nickname: String, email: String) {
    this()
    this.thread = thread
    this.id = id
    this.nickname = nickname
    this.email = email
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putInt(id)
    BinaryHelper.encodeString(builder, nickname, withLen = true)
    BinaryHelper.encodeString(builder, email, withLen = true)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    id = data.getInt()
    nickname = BinaryHelper.decodeString(data, withLen = true)
    email = BinaryHelper.decodeString(data, withLen = true)
    this
  }
}
