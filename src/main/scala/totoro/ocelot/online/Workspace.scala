package totoro.ocelot.online

import akka.http.scaladsl.model.ws.TextMessage
import akka.stream.scaladsl.{Source, SourceQueueWithComplete}
import totoro.ocelot.brain.entity.{APU, Cable, Case, EEPROM, Memory, Screen}
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

    val apu = new APU(Tier.Two)
    computer.add(apu)

    val memory = new Memory(Tier.Six)
    computer.add(memory)

    computer.add(Loot.OpenOsBIOS.create())
    computer.add(Loot.OpenOsFloppy.create())

    val screen = new Screen(Tier.Two)
    cable.node.connect(screen.node)
  }

  def subscribe(producer: SourceQueueWithComplete[TextMessage]): Unit = {
    EventBus.listenTo(classOf[BeepEvent], { case event: BeepEvent =>
      println(s"[EVENT] Beep (frequency = ${event.frequency}, duration = ${event.duration})")
      producer offer TextMessage(s"beep ${event.frequency} ${event.duration}")
    })
    EventBus.listenTo(classOf[BeepPatternEvent], { case event: BeepPatternEvent =>
      println(s"[EVENT] Beep (${event.pattern})")
      producer offer TextMessage(s"beep-pattern ${event.pattern}")
    })
    EventBus.listenTo(classOf[MachineCrashEvent], { case event: MachineCrashEvent =>
      println(s"[EVENT] Machine crash! (${event.message})")
      producer offer TextMessage(s"crash ${event.message}")
    })
    EventBus.listenTo(classOf[TextBufferSetEvent], { case event: TextBufferSetEvent =>
      println(s"[EVENT] Text buffer set (${event.x}, ${event.y}, ${event.value}, ${event.vertical})")
      producer offer TextMessage(s"set ${event.x} ${event.y} ${event.value} ${event.vertical}")
    })
    EventBus.listenTo(classOf[TextBufferSetForegroundColorEvent], { case event: TextBufferSetForegroundColorEvent =>
      println(s"[EVENT] Foreground color changed (${event.color})")
      producer offer TextMessage(s"foreground ${event.color}")
    })
    EventBus.listenTo(classOf[TextBufferSetBackgroundColorEvent], { case event: TextBufferSetBackgroundColorEvent =>
      println(s"[EVENT] Background color changed (${event.color})")
      producer offer TextMessage(s"background ${event.color}")
    })
  }

  def turnOn(): Unit = {
    computer.turnOn()
  }

  def isRunning: Boolean = {
    computer.machine.isRunning
  }

  def update(): Unit = {
    computer.update()
  }

  def turnOff(): Unit = {
    computer.turnOff()
  }
}
