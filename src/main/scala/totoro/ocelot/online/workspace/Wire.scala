package totoro.ocelot.online.workspace

import java.nio.{ByteBuffer, ByteOrder}

import akka.util.ByteStringBuilder
import totoro.ocelot.brain.entity.Cable
import totoro.ocelot.online.util.BinaryHelper

/**
  * Represents a connection between [[totoro.ocelot.online.workspace.block.Block]]s on frontend.
  * Wire is a visualization of a [[Cable]].
  */

case class Wire(var id: Int, var blockIdA: Int, var blockIdB: Int, var cable: Cable) {
  private implicit val DefaultOrder: ByteOrder = BinaryHelper.DefaultOrder

  /**
    * The representation of Wire for frontend includes only the ID of the wire itself,
    * and IDs of both connected Blocks.
    * Zero (0) will be transmitted if the ID is not defined (but this must not happen usually).
    */
  def encode(builder: ByteStringBuilder): Unit = {
    builder.putInt(id)
    builder.putInt(blockIdA)
    builder.putInt(blockIdB)
  }
}

object Wire {
  /**
    * Decoded Wire object will have `cable` entity set to null.
    * That is because frontend does not operate with entities. Still this 'stripped down' version of the object
    * can be used to update the real Wire object data.
    */
  def decode(data: ByteBuffer): Wire = {
    val id = data.getInt()
    val blockIdA = data.getInt()
    val blockIdB = data.getInt()
    Wire(id, blockIdA, blockIdB, null)
  }
}
