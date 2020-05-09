package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketType
import totoro.ocelot.online.util.BinaryHelper

/**
  * Request for user login.
  *
  * Expected response: USER_DETAILS or FAIL.
  *
  * Packet format:
  * 2b            Xb        2b            Yb
  * <nickname-len><nickname><password-len><password>
  */

class PacketLogin extends Packet {
  override var packetType: Byte = PacketType.LOGIN

  var nickname: String = _
  var password: String = _

  def this(thread: Int, nickname: String, password: String) {
    this()
    this.thread = thread
    this.nickname = nickname
    this.password = password
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    BinaryHelper.encodeString(builder, nickname, withLen = true)
    BinaryHelper.encodeString(builder, password, withLen = true)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    nickname = BinaryHelper.decodeString(data, withLen = true)
    password = BinaryHelper.decodeString(data, withLen = true)
    this
  }
}
