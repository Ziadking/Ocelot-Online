package totoro.ocelot.online.workspace

import totoro.ocelot.brain.workspace.{Workspace => BrainWorkspace}
import totoro.ocelot.online.user.User
import totoro.ocelot.online.user.permission.Permission
import totoro.ocelot.online.workspace.block.Block

import scala.collection.mutable.ListBuffer

/**
  * Workspace - is a single project inside of Ocelot.Online.
  * It contains it's own setup of Ocelot components (in form of blocks and wires).
  * And also a set of workspace-related permissions.
  */

class Workspace(var name: String, creator: User) {
  val permissions: ListBuffer[Permission] = ListBuffer.empty
  val blocks: ListBuffer[Block] = ListBuffer.empty
  val wires: ListBuffer[Wire] = ListBuffer.empty
  val brainWorkspace: BrainWorkspace = new BrainWorkspace()

  def update(): Unit = {
    brainWorkspace.update()
  }
}
