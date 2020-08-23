package totoro.ocelot.online.workspace.block

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.brain.entity.traits.Entity
import totoro.ocelot.brain.entity.{CPU, Case, GraphicsCard, HDDManaged, HDDUnmanaged, InternetCard, Memory, Redstone}
import totoro.ocelot.brain.loot.Loot
import totoro.ocelot.brain.util.Tier
import totoro.ocelot.brain.workspace.Workspace
import totoro.ocelot.online.workspace.block.BlockTypes.BlockType

class BlockCase extends FoldableBlock {
  override var blockType: BlockType = BlockTypes.CASE

  private var computer: Case = _

  def this(workspace: Workspace, id: Int, x: Int, y: Int, tier: Int) {
    this()
    init(id, x, y)

    computer = new Case(tier)

    computer.add(new CPU(Tier.Three))
    computer.add(new GraphicsCard(Tier.Three))
    computer.add(new Memory(Tier.Six))
    computer.add(new Memory(Tier.Six))

    val hdd = new HDDManaged(Tier.Three)
    hdd.workspace = workspace
    hdd.node // TODO: refactor WorkspaceAware system
    computer.add(hdd)

    val unmanagedHdd = new HDDUnmanaged(Tier.Three, "unmanaged")
    unmanagedHdd.setAddress("734e0f26-5819-45e5-9069-a91fa5116b5f")
    computer.add(unmanagedHdd)

    computer.add(new InternetCard())
    computer.add(new Redstone.Tier2())

    computer.add(Loot.AdvLoaderEEPROM.create())
    computer.add(Loot.OpenOsFloppy.create())
  }

  override def entity: Entity = computer

  override def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    super.encode(builder)
    builder.putByte(computer.tier.toByte)
  }

  override def decode(data: ByteBuffer, withBlockType: Boolean): Block = {
    super.decode(data, withBlockType)
    // TODO: decide if the case `tier` need to be decoded in here, and how
  }
}
