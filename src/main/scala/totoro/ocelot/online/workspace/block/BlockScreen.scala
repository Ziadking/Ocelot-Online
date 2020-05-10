package totoro.ocelot.online.workspace.block

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
}
