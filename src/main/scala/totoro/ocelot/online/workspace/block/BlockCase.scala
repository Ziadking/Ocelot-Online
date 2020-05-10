package totoro.ocelot.online.workspace.block

import totoro.ocelot.brain.entity.traits.Entity
import totoro.ocelot.brain.entity.{CPU, Case, GraphicsCard, HDDManaged, HDDUnmanaged, InternetCard, Memory, Redstone}
import totoro.ocelot.brain.loot.Loot
import totoro.ocelot.brain.network.Network
import totoro.ocelot.brain.util.Tier
import totoro.ocelot.online.workspace.block.BlockTypes.BlockType

class BlockCase extends FoldableBlock {
  override var blockType: BlockType = BlockTypes.CASE

  private var computer: Case = _

  def this(id: Int, x: Int, y: Int, tier: Int) {
    this()
    init(id, x, y)

    val network = new Network()
    computer = new Case(tier)
    network.connect(computer)

    computer.add(new CPU(Tier.Three))
    computer.add(new GraphicsCard(Tier.Three))
    computer.add(new Memory(Tier.Six))
    computer.add(new Memory(Tier.Six))

    computer.add(new HDDManaged("b59b07db-846a-4f23-ba02-420c916f294d", Tier.Three, "hdd"))

    val unmanagedHdd = new HDDUnmanaged(Tier.Three, "unmanaged")
    unmanagedHdd.setAddress("734e0f26-5819-45e5-9069-a91fa5116b5f")
    computer.add(unmanagedHdd)

    computer.add(new InternetCard())
    computer.add(new Redstone.Tier2())

    computer.add(Loot.AdvLoaderEEPROM.create())
    computer.add(Loot.OpenOsFloppy.create())
  }

  override def entity: Entity = computer
}
