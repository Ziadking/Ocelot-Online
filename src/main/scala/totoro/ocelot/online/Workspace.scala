package totoro.ocelot.online

import akka.http.scaladsl.model.ws.TextMessage
import akka.stream.scaladsl.SourceQueueWithComplete
import totoro.ocelot.brain.entity.{CPU, Cable, Case, GraphicsCard, InternetCard, Keyboard, Memory, Screen}
import totoro.ocelot.brain.event._
import totoro.ocelot.brain.loot.Loot
import totoro.ocelot.brain.network.Network
import totoro.ocelot.brain.user.User
import totoro.ocelot.brain.util.{PackedColor, Tier}
import totoro.ocelot.brain.{Ocelot => Brain}

class Workspace {
  private val defaultUser: User = User("noname")
  private var computer: Case = _
  private var screen: Screen = _
  private var producer: SourceQueueWithComplete[TextMessage] = _

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

    val internet = new InternetCard()
    computer.add(internet)

    computer.add(Loot.OpenOsBIOS.create())
    computer.add(Loot.OpenOsFloppy.create())

    screen = new Screen(Tier.Two)
    cable.node.connect(screen.node)

    val keyboard = new Keyboard()
    screen.node.connect(keyboard.node)
  }

  def subscribe(producer: SourceQueueWithComplete[TextMessage]): Unit = {
    this.producer = producer
    // register some listeners
    EventBus.listenTo(classOf[BeepEvent], { case event: BeepEvent =>
      producer offer TextMessage(s"beep\n${event.frequency}\n${event.duration}")
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

  def keyDown(character: Char, code: Int): Unit = {
    screen.keyDown(character, code, defaultUser)
  }

  def keyUp(character: Char, code: Int): Unit = {
    screen.keyUp(character, code, defaultUser)
  }

  def turnOff(): Unit = {
    computer.turnOff()
    println("Computer turned off.")
  }

  private def getColor(value: PackedColor.Color): Int = {
    screen.data.format.inflate(screen.data.format.deflate(value))
  }

  def sendState(): Unit = {
    val state = new StringBuilder("state\n")

    // write current colors
    state ++= getColor(screen.data.foreground).toString + "\n"
    state ++= getColor(screen.data.background).toString + "\n"

    // write the matrix, optimized as a bunch of `set` operations
    var lastColor: Short = -1
    var lastX: Int = -1
    var lastY: Int = -1
    val value: StringBuilder = new StringBuilder

    def set(): Unit = {
      if (value.nonEmpty) {
        state ++= lastX.toString + "\n"
        state ++= lastY.toString + "\n"
        val fore = PackedColor.unpackForeground(lastColor, screen.data.format)
        val back = PackedColor.unpackBackground(lastColor, screen.data.format)
        state ++= fore.toString + "\n"
        state ++= back.toString + "\n"
        state ++= value.result() + "\n"
        value.clear()
      }
    }

    for (y <- 0 until screen.data.height) {
      for (x <- 0 until screen.data.width) {
        val currentColor = screen.data.color(y)(x)
        val currentChar = screen.data.buffer(y)(x)
        if (currentColor != lastColor) {
          if (lastColor >= 0) {
            set()
          }
          lastColor = currentColor
          lastX = x
          lastY = y
        }
        value += currentChar
      }
      set()
      lastX = 0
      lastY += 1
    }
    // write the last one set
    set()

    // send
    producer offer TextMessage(state.result())
  }
}