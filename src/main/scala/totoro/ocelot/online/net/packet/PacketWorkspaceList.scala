package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketTypes
import totoro.ocelot.online.net.PacketTypes.PacketType
import totoro.ocelot.online.workspace.WorkspaceDescription

import scala.collection.mutable.ListBuffer

/**
  * Data packet with a list of all [[totoro.ocelot.online.workspace.Workspace]]s descriptions.
  *
  * No response is expected.
  *
  * Packet format:
  *  4b            2b        Xb
  * (<workspace-id><name-len><name>, ...)
  */

class PacketWorkspaceList extends Packet {
  override var packetType: PacketType = PacketTypes.WORKSPACE_LIST

  val list: ListBuffer[WorkspaceDescription] = ListBuffer.empty

  def this(thread: Int, list: ListBuffer[WorkspaceDescription]) {
    this()
    this.thread = thread
    this.list.addAll(list)
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    list.foreach(_.encode(builder))
    builder
  }

  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    list.clear()
    while (data.hasRemaining) {
      list.addOne(WorkspaceDescription.decode(data))
    }
    this
  }
}
