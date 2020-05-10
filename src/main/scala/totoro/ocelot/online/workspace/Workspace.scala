package totoro.ocelot.online.workspace

import java.nio.ByteOrder

import akka.util.ByteStringBuilder
import totoro.ocelot.brain.entity.Cable
import totoro.ocelot.brain.entity.traits.Environment
import totoro.ocelot.brain.workspace.{Workspace => Brainspace}
import totoro.ocelot.online.user.User
import totoro.ocelot.online.user.permission.Permission
import totoro.ocelot.online.util.{BinaryHelper, IdGen}
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

  val brainspace: Brainspace = new Brainspace()

  /**
    * Adds the block to workspace
    */
  def add(block: Block): Unit = {
    blocks.addOne(block)
    brainspace.add(block.entity)
  }

  /**
    * Removes the block and all connected wires
    */
  def removeBlock(id: Int): Unit = {
    removeBlock(blocks.find(_.id == id).orNull)
  }

  /**
    * Removes the block and all connected wires
    */
  def removeBlock(block: Block): Unit = {
    if (block != null) {
      disconnect(block)
      brainspace.remove(block.entity)
      blocks.filterInPlace(_.id != block.id)
    }
  }

  private def connectBlockToCable(cable: Cable, block: Block): Unit = {
    block.entity match {
      case e: Environment => cable.connect(e)
      case _ => // well, not the case
    }
  }

  /**
    * Creates a new Wire between given two blocks.
    * @return new Wire object
    */
  def connect(a: Block, b: Block): Wire = connect(a.id, b.id)

  /**
    * Creates a new Wire between given two blocks.
    * @return new Wire object
    */
  def connect(blockIdA: Int, blockIdB: Int): Wire = {
    val a = blocks.find(_.id == blockIdA)
    val b = blocks.find(_.id == blockIdB)
    if (a.isDefined && b.isDefined) {
      val cable = new Cable()
      brainspace.add(cable)
      connectBlockToCable(cable, a.get)
      connectBlockToCable(cable, b.get)
      val wire = Wire(IdGen.id(), blockIdA, blockIdB, new Cable())
      wires.addOne(wire)
      wire
    }
    else null
  }

  /**
    * Removes single wire by its ID
    */
  def removeWire(id: Int): Unit = {
    val wire = wires.find(_.id == id)
    if (wire.isDefined) {
      brainspace.remove(wire.get.cable)
      wires.filterInPlace(_.id != id)
    }
  }

  /**
    * Removes single wire
    */
  def removeWire(wire: Wire): Unit = removeWire(wire.id)

  /**
    * Removes all wires between these two blocks
    */
  def disconnect(blockIdA: Int, blockIdB: Int): Unit = {
    val result = wires.filter(w =>
      (w.blockIdA == blockIdA && w.blockIdB == blockIdB) ||
        (w.blockIdA == blockIdB && w.blockIdB == blockIdA))
    result.foreach(removeWire)
  }

  /**
    * Removes all wires connected to this block
    */
  def disconnect(blockId: Int): Unit = {
    val result = wires.filter(w => w.blockIdA == blockId || w.blockIdB == blockId)
    result.foreach(removeWire)
  }

  /**
    * Removes all wires connected to this block
    */
  def disconnect(block: Block): Unit = disconnect(block.id)

  /**
    * Update the Brain workspace (i.e. all the entities inside).
    */
  def update(): Unit = {
    brainspace.update()
  }

  // -------------------------------------------------------------------------------------------------------------- //
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
