package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType
import totoro.ocelot.online.util.BinaryHelper

/**
  * Data packet with [[totoro.ocelot.online.workspace.Workspace]] basic details.
  *
  * No response is expected.
  *
  * Packet format:
  * 4b            2b        Xb
  * <workspace-id><name-len><name>
  */

class PacketWorkspaceDescription extends Packet {
  override var packetType: PacketType = PacketTypes.WORKSPACE_DESCRIPTION

  var id: Int = _
  var name: String = _

  def this(thread: Int, id: Int, name: String) {
    this()
    this.thread = thread
    this.id = id
    this.name = name
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putInt(id)
    BinaryHelper.encodeString(builder, name, withLen = true)
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    id = data.getInt()
    name = BinaryHelper.decodeString(data, withLen = true)
    this
  }
}
