package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType
import totoro.ocelot.online.user.permission.Permission

import scala.collection.mutable.ListBuffer

/**
  * Data packet with a list of all [[totoro.ocelot.online.user.permission.Permission]]s for a workspace.
  *
  * No response is expected.
  *
  * Packet format:
  * 4b             1b          4b [optional]    4b
  * <workspace-id>(<target-id>[<target-user-id>]<flag>, ...)
  */

class PacketWorkspacePermissions extends Packet {
  override var packetType: PacketType = PacketTypes.WORKSPACE_PERMISSIONS

  var id: Int = _
  val list: ListBuffer[Permission] = ListBuffer.empty

  def this(thread: Int, id: Int, list: Seq[Permission]) {
    this()
    this.thread = thread
    this.id = id
    this.list.addAll(list)
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putInt(id)
    list.foreach(permission => {
      permission.encode(builder)
    })
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    id = data.getInt()
    list.clear()
    while (data.hasRemaining) {
      list.addOne(Permission.decode(data))
    }
    this
  }
}
