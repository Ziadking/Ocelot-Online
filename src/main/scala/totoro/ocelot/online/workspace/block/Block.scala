package totoro.ocelot.online.workspace.block

import java.nio.{ByteBuffer, ByteOrder}

import akka.util.ByteStringBuilder
import totoro.ocelot.brain.entity.traits.Entity
import totoro.ocelot.online.util.BinaryHelper

/**
  * Represents a block on frontend.
  * Usually block is a visualization of some [[Entity]].
  * Can be connected together with a [[totoro.ocelot.online.workspace.Wire]].
  */

case class Block(id: Int, x: Int, y: Int, entity: Entity) {
  private implicit val DefaultOrder: ByteOrder = BinaryHelper.DefaultOrder

  /**
    * Encode a representation of this Block for frontend.
    * It does not include the Entity.
    */
  def encode(builder: ByteStringBuilder): Unit = {
    builder.putInt(id)
    builder.putInt(x)
    builder.putInt(y)
  }
}

object Block {
  /**
    * Decoded Block object will have `entity` set to null.
    * That is because frontend does not operate with entities. Still this 'stripped down' version of the object
    * can be used to update the real Block object data.
    */
  def decode(data: ByteBuffer): Block = {
    val id = data.getInt()
    val x = data.getInt()
    val y = data.getInt()
    Block(id, x, y, null)
  }
}
