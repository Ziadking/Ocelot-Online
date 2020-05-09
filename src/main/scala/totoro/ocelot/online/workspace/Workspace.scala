package totoro.ocelot.online.workspace

import java.nio.ByteOrder

import akka.util.ByteStringBuilder
import totoro.ocelot.brain.workspace.{Workspace => BrainWorkspace}
import totoro.ocelot.online.user.User
import totoro.ocelot.online.user.permission.Permission
import totoro.ocelot.online.util.BinaryHelper
import totoro.ocelot.online.workspace.block.Block

import scala.collection.mutable.ListBuffer

/**
  * Workspace - is a single project inside of Ocelot.Online.
  * It contains it's own setup of Ocelot components (in form of blocks and wires).
  * And also a set of workspace-related permissions.
  */

class Workspace(var id: Int, var name: String, creator: User) {
  val permissions: ListBuffer[Permission] = ListBuffer.empty
  val blocks: ListBuffer[Block] = ListBuffer.empty
  val wires: ListBuffer[Wire] = ListBuffer.empty
  val brainWorkspace: BrainWorkspace = new BrainWorkspace()

  def update(): Unit = {
    brainWorkspace.update()
  }

  // netcode-related stuff
  private implicit val DefaultOrder: ByteOrder = BinaryHelper.DefaultOrder

  /**
    * Build a workspace state for frontend.
    * Format:
    * <id><name><number-of-permissions>(<permission>, ...)<num-of-blocks>(<block>, ...)<num-of-wires>(<wire>, ...)
    */
  def encode(builder: ByteStringBuilder): Unit = {
    // descpription
    builder.putInt(id)
    BinaryHelper.encodeString(builder, name, withLen = true)

    // permissions
    builder.putInt(permissions.size)
    permissions.foreach(permission => {
      permission.encode(builder)
    })

    // blocks
    builder.putInt(blocks.size)
    blocks.foreach(block => {
      block.encode(builder)
    })

    // wires
    builder.putInt(wires.size)
    wires.foreach(wire => {
      wire.encode(builder)
    })
  }
}
