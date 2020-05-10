package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType
import totoro.ocelot.online.util.BinaryHelper

/**
  * Request for user registration.
  *
  * Expected response: USER_DETAILS or FAIL.
  *
  * Packet format:
  * 2b            Xb        2b            Yb        2b         Zb
  * <nickname-len><nickname><password-len><password><email-len><email>
  */

class PacketRegister extends Packet {
  override var packetType: PacketType = PacketTypes.REGISTER

  var nickname: String = _
  var password: String = _
  var email: String = _

  def this(thread: Int, nickname: String, password: String, email: String) {
    this()
    this.thread = thread
    this.nickname = nickname
    this.password = password
    this.email = email
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    BinaryHelper.encodeString(builder, nickname, withLen = true)
    BinaryHelper.encodeString(builder, password, withLen = true)
    BinaryHelper.encodeString(builder, email, withLen = true)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    nickname = BinaryHelper.decodeString(data, withLen = true)
    password = BinaryHelper.decodeString(data, withLen = true)
    email = BinaryHelper.decodeString(data, withLen = true)
    this
  }
}
