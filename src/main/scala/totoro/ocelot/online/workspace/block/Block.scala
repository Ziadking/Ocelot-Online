package totoro.ocelot.online.workspace.block

import java.nio.{ByteBuffer, ByteOrder}

import akka.util.ByteStringBuilder
import totoro.ocelot.brain.entity.traits.{Entity, Environment}
import totoro.ocelot.online.util.BinaryHelper
import totoro.ocelot.online.workspace.block.BlockTypes.BlockType

/**
  * Represents a block on frontend.
  * Usually block is a visualization of some [[Entity]].
  * Can be connected together with a [[totoro.ocelot.online.workspace.Wire]].
  */

abstract class Block {
  private implicit val DefaultOrder: ByteOrder = BinaryHelper.DefaultOrder

  var blockType: BlockType
  var id: Int = _
  var x: Int = _
  var y: Int = _

  /**
    * Returns a Brain entity, that serves as a connecting point to the network
    * (Internally the block can be complex, with several Entities. The exact configuration is up to the implementation.)
    */
  def entity: Entity

  protected def init(id: Int, x: Int, y: Int) {
    this.id = id
    this.x = x
    this.y = y
  }

  /**
    * First part of Block encoding is standard:
    * 1b    4b  4b 4b
    * <type><id><x><y>
    *
    * Then, if `entity` is defined and is an Environment, this method will try to encode it's address:
    * 1b Xb
    * <1><address>
    *
    * Otherwise the flag will be set to 0:
    * 1b
    * <0>
    */
  def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    builder.putByte(blockType)
    builder.putInt(id)
    builder.putInt(x)
    builder.putInt(y)
    if (entity != null) {
      entity match {
        case e: Environment =>
          builder.putByte(1)
          BinaryHelper.encodeString(builder, e.node.address, withLen = true)
        case _ => builder.putByte(0)
      }
    } else {
      builder.putByte(0)
    }
    builder
  }

  def decode(data: ByteBuffer, withBlockType: Boolean = false): Block = {
    if (withBlockType) {
      this.blockType = data.get()
    }
    this.id = data.getInt()
    this.x = data.getInt()
    this.y = data.getInt()
    this
  }
}
