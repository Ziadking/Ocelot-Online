package totoro.ocelot.online.workspace.block

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.brain.entity.traits.Entity
import totoro.ocelot.brain.entity.{Keyboard, Screen}
import totoro.ocelot.brain.network.Network
import totoro.ocelot.online.workspace.block.BlockTypes.BlockType

class BlockScreen extends FoldableBlock {
  override var blockType: BlockType = BlockTypes.SCREEN

  private var screen: Screen = _
  private var keyboard: Keyboard = _

  def this(id: Int, x: Int, y: Int, tier: Int) {
    this()
    init(id, x, y)

    val network = new Network()
    screen = new Screen(tier)
    keyboard = new Keyboard()
    network.connect(screen)
    screen.connect(keyboard)
  }

  override def entity: Entity = screen

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putByte(screen.tier.toByte)
  }

  override def decode(data: ByteBuffer, withBlockType: Boolean): Block = {
    super.decode(data, withBlockType)
    // TODO: decide if the case `tier` need to be decoded in here, and how
  }
}
