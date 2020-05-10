package totoro.ocelot.online.workspace.block

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder

/**
  * Convenience implementation of blocks that can be both turned on/off and also folded/unfolded.
  */
abstract class FoldableBlock extends Block {
  var folded = true
  var turnedOn = true

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putByte(if (folded) 1 else 0)
    builder.putByte(if (turnedOn) 1 else 0)
    builder
  }

  override def decode(data: ByteBuffer, withBlockType: Boolean): Block = {
    super.decode(data, withBlockType)
    this.folded = data.get() == 1
    this.turnedOn = data.get() == 1
    this
  }
}
