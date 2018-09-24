package totoro.ocelot.online

import akka.http.scaladsl.model.ws.TextMessage
import akka.stream.scaladsl.SourceQueueWithComplete
import totoro.ocelot.brain.entity.{CPU, Cable, Case, GraphicsCard, Memory, Screen}
import totoro.ocelot.brain.event._
import totoro.ocelot.brain.loot.Loot
import totoro.ocelot.brain.network.Network
import totoro.ocelot.brain.util.Tier
import totoro.ocelot.brain.{Ocelot => Brain}

class Workspace {
  private var computer: Case = _

  def init(): Unit = {
    Brain.initialize()

    // setup simple network with a computer
    val cable = new Cable()
    new Network(cable.node)

    computer = new Case(Tier.Four)
    cable.node.connect(computer.node)

    val cpu = new CPU(Tier.Three)
    computer.add(cpu)

    val gpu = new GraphicsCard(Tier.Three)
    computer.add(gpu)

    val memory = new Memory(Tier.Six)
    computer.add(memory)

    computer.add(Loot.OpenOsBIOS.create())
    computer.add(Loot.OpenOsFloppy.create())

    val screen = new Screen(Tier.Two)
    cable.node.connect(screen.node)
  }

  def subscribe(producer: SourceQueueWithComplete[TextMessage]): Unit = {
    EventBus.listenTo(classOf[BeepEvent], { case event: BeepEvent =>
      producer offer TextMessage(s"beep ${event.frequency} ${event.duration}")
    })
    EventBus.listenTo(classOf[BeepPatternEvent], { case event: BeepPatternEvent =>
      producer offer TextMessage(s"beep-pattern ${event.pattern}")
    })
    EventBus.listenTo(classOf[MachineCrashEvent], { case event: MachineCrashEvent =>
      producer offer TextMessage(s"crash ${event.message}")
    })
    EventBus.listenTo(classOf[TextBufferSetEvent], { case event: TextBufferSetEvent =>
      producer offer TextMessage(s"set ${event.x} ${event.y} ${event.vertical} ${event.value}")
    })
    EventBus.listenTo(classOf[TextBufferSetForegroundColorEvent], { case event: TextBufferSetForegroundColorEvent =>
      producer offer TextMessage(s"foreground ${event.color}")
    })
    EventBus.listenTo(classOf[TextBufferSetBackgroundColorEvent], { case event: TextBufferSetBackgroundColorEvent =>
      producer offer TextMessage(s"background ${event.color}")
    })
  }

  def turnOn(): Unit = {
    computer.turnOn()
    println("Computer turned on.")
  }

  def isRunning: Boolean = {
    computer.machine.isRunning
  }

  def update(): Unit = {
    computer.update()
  }

  def turnOff(): Unit = {
    computer.turnOff()
    println("Computer turned off.")
  }
}
