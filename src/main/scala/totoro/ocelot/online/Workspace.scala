package totoro.ocelot.online

import akka.http.scaladsl.model.ws.TextMessage
import akka.stream.scaladsl.SourceQueueWithComplete
import totoro.ocelot.brain.entity.{CPU, Case, GraphicsCard, HDDManaged, HDDUnmanaged, InternetCard, Keyboard, Memory, Redstone, Screen}
import totoro.ocelot.brain.event._
import totoro.ocelot.brain.loot.Loot
import totoro.ocelot.brain.user.User
import totoro.ocelot.brain.util.{PackedColor, Tier}
import totoro.ocelot.brain.workspace.{Workspace => BSpace}
import totoro.ocelot.brain.{Ocelot => Brain}

import java.nio.file.Paths

class Workspace {
  private val defaultUser: User = User("noname")
  private var workspace: BSpace = _
  private var computer: Case = _
  private var screen: Screen = _
  private var keyboard: Keyboard = _
  private var producer: SourceQueueWithComplete[TextMessage] = _

  def init(): Unit = {
    Brain.initialize()

    // setup simple workspace with a computer
    workspace = new BSpace(Paths.get(Settings.get.savePath))

    computer = workspace.add(new Case(Tier.Four))

    computer.inventory(0) = new CPU(Tier.Three)
    computer.inventory(1) = new GraphicsCard(Tier.Three)
    computer.inventory(2) = new Memory(Tier.Six)
    computer.inventory(3) = new Memory(Tier.Six)

    computer.inventory(4) = new HDDManaged(Tier.Three, "b59b07db-846a-4f23-ba02-420c916f294d")

    val unmanagedHdd = new HDDUnmanaged(Tier.Three, "unmanaged")
    unmanagedHdd.setAddress("734e0f26-5819-45e5-9069-a91fa5116b5f")
    computer.inventory(5) = unmanagedHdd

    computer.inventory(6) = new InternetCard()
    computer.inventory(7) = new Redstone.Tier2()

    computer.inventory(8) = Loot.AdvLoaderEEPROM.create()
    computer.inventory(9) = Loot.OpenOsFloppy.create()

    screen = workspace.add(new Screen(Tier.Two))
    computer.connect(screen)

    keyboard = new Keyboard()
    screen.connect(keyboard)
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
      producer offer TextMessage(s"copy\n${event.x}\n${event.y}\n${event.width}\n${event.height}\n" +
        s"${event.horizontalTranslation}\n${event.verticalTranslation}")
    })
    EventBus.listenTo(classOf[TextBufferFillEvent], { case event: TextBufferFillEvent =>
      producer offer TextMessage(s"fill\n${event.x}\n${event.y}\n${event.width}\n${event.height}\n${event.value}")
    })
    EventBus.listenTo(classOf[TextBufferSetResolutionEvent], { case event: TextBufferSetResolutionEvent =>
      producer offer TextMessage(s"resolution\n${event.width}\n${event.height}")
    })
  }

  def turnOn(): Unit = {
    computer.turnOn()
    Ocelot.log.debug("Computer turned on.")
  }

  def isRunning: Boolean = {
    computer.machine.isRunning
  }

  def update(): Unit = {
    workspace.update()
  }

  def keyDown(character: Char, code: Int, user: User = defaultUser): Unit = {
    screen.keyDown(character, code, user)
  }

  def keyUp(character: Char, code: Int, user: User = defaultUser): Unit = {
    screen.keyUp(character, code, user)
  }

  def releasePressedKeys(user: User = defaultUser): Unit = {
    keyboard.releasePressedKeys(user)
  }

  def clipboard(value: String, user: User = defaultUser): Unit = {
    screen.clipboard(value, user)
  }

  def mouseDown(x: Int, y: Int, button: Int, user: User = defaultUser): Unit = {
    screen.mouseDown(x, y, button, user)
  }

  def mouseUp(x: Int, y: Int, button: Int, user: User = defaultUser): Unit = {
    screen.mouseUp(x, y, button, user)
  }

  def mouseDrag(x: Int, y: Int, button: Int, user: User = defaultUser): Unit = {
    screen.mouseDrag(x, y, button, user)
  }

  def mouseScroll(x: Int, y: Int, delta: Int, user: User = defaultUser): Unit = {
    screen.mouseScroll(x, y, delta, user)
  }

  def turnOff(): Unit = {
    computer.turnOff()
    Ocelot.log.debug("Computer turned off.")
  }

  private def getColor(value: PackedColor.Color): Int = {
    screen.data.format.inflate(screen.data.format.deflate(value))
  }

  def sendState(): Unit = {
    val state = new StringBuilder("state\n")

    // write current resolution
    state ++= screen.data.width + "\n"
    state ++= screen.data.height + "\n"

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

  def shutdown(): Unit = {
    Brain.shutdown()
  }
}
