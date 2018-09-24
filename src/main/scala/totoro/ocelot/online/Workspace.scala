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
      producer offer TextMessage(s"beep\n${event.frequency} ${event.duration}")
    })
    EventBus.listenTo(classOf[BeepPatternEvent], { case event: BeepPatternEvent =>
      producer offer TextMessage(s"beep-pattern\n${event.pattern}")
    })
    EventBus.listenTo(classOf[MachineCrashEvent], { case event: MachineCrashEvent =>
      producer offer TextMessage(s"crash\n${event.message}")
    })
    EventBus.listenTo(classOf[TextBufferSetEvent], { case event: TextBufferSetEvent =>
      producer offer TextMessage(s"set\n${event.x}\n${event.y}\n${event.vertical}\n${event.value}")
    })
    EventBus.listenTo(classOf[TextBufferSetForegroundColorEvent], { case event: TextBufferSetForegroundColorEvent =>
      producer offer TextMessage(s"foreground\n${event.color}")
    })
    EventBus.listenTo(classOf[TextBufferSetBackgroundColorEvent], { case event: TextBufferSetBackgroundColorEvent =>
      producer offer TextMessage(s"background\n${event.color}")
    })
    EventBus.listenTo(classOf[TextBufferCopyEvent], { case event: TextBufferCopyEvent =>
      producer offer TextMessage(s"copy\n${event.column}\n${event.row}\n${event.width}\n${event.height}\n" +
        s"${event.horizontalTranslation}\n${event.verticalTranslation}")
    })
    EventBus.listenTo(classOf[TextBufferFillEvent], { case event: TextBufferFillEvent =>
      producer offer TextMessage(s"fill\n${event.column}\n${event.row}\n${event.width}\n${event.height}\n${event.value}")
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
