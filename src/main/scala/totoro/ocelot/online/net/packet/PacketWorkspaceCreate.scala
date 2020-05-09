package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketType
import totoro.ocelot.online.util.BinaryHelper

/**
  * Request to create a new workspace.
  *
  * Expected response: WORKSPACE_DESCRIPTION or FAIL.
  *
  * Packet format:
  * 2b        Xb
  * <name-len><name>
  */

class PacketWorkspaceCreate extends Packet {
  override var packetType: Byte = PacketType.WORKSPACE_CREATE

  var name: String = _

  def this(thread: Int, name: String) {
    this()
    this.thread = thread
    this.name = name
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    BinaryHelper.encodeString(builder, name, withLen = true)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    name = BinaryHelper.decodeString(data, withLen = true)
    this
  }
}
