package totoro.ocelot.online.workspace.block

import totoro.ocelot.brain.entity.traits.Entity
import totoro.ocelot.online.workspace.Wire

/**
  * Represents a block on frontend.
  * Usually block is a visualization of some [[Entity]].
  * Can be connected together with a [[Wire]].
  */

case class Block(x: Int, y: Int, entity: Entity)
