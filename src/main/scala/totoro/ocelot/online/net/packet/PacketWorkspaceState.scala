package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketType
import totoro.ocelot.online.workspace.Workspace

/**
  * Data packet with [[totoro.ocelot.online.workspace.Workspace]] full state.
  * This includes workspace description, list of permissions, list of blocks and list of wires.
  *
  * No response is expected.
  *
  * Packet format:
  * 4b            2b        Xb    4b                     Yb                 4b             Zb            4b            Qb
  * <workspace-id><name-len><name><number-of-permissions>(<permission>, ...)<num-of-blocks>(<block>, ...)<num-of-wires>(<wire>, ...)
  */

class PacketWorkspaceState extends Packet {
  override var packetType: Byte = PacketType.WORKSPACE_STATE

  var workspace: Workspace = _

  def this(thread: Int, workspace: Workspace) {
    this()
    this.thread = thread
    this.workspace = workspace
  }

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    workspace.encode(builder)
    builder
  }

  /**
    * NOTE:
    * Actually we do not need this method here, because the state package is intended only for frontend.
    * All decoding will be performed on JS side.
    */
  override def decode(data: ByteBuffer, withType: Boolean): Packet = {
    super.decode(data, withType)
    this
  }
}
