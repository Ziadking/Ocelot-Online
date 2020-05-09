package totoro.ocelot.online.workspace

import totoro.ocelot.brain.entity.Cable
import totoro.ocelot.online.workspace.block.Block

/**
  * Represents a connection between [[Block]]s on frontend.
  * Wire is a visualization of a [[Cable]].
  */

case class Wire(var a: Block, var b: Block, var cable: Cable)
