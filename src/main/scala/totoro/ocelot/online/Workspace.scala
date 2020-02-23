package totoro.ocelot.online

import akka.http.scaladsl.model.ws.{BinaryMessage, TextMessage}
import akka.stream.scaladsl.SourceQueueWithComplete
import totoro.ocelot.brain.entity.{CPU, Case, GraphicsCard, HDDManaged, HDDUnmanaged, InternetCard, Keyboard, Memory, Redstone, Screen}
import totoro.ocelot.brain.event._
import totoro.ocelot.brain.loot.Loot
import totoro.ocelot.brain.user.User
import totoro.ocelot.brain.util.{PackedColor, Tier}
import totoro.ocelot.brain.workspace.{Workspace => BSpace}
import totoro.ocelot.brain.{Ocelot => Brain}
import totoro.ocelot.online.net.Packet

class Workspace {
  private val defaultUser: User = User("noname")
  private var workspace: BSpace = _
  private var computer: Case = _
  private var screen: Screen = _
  private var keyboard: Keyboard = _
  private var producer: SourceQueueWithComplete[BinaryMessage] = _

  def init(): Unit = {
    Brain.initialize()

    // setup simple workspace with a computer
    workspace = new BSpace()

    computer = workspace.add(new Case(Tier.Four))

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

    screen = workspace.add(new Screen(Tier.Two))
    computer.connect(screen)

    keyboard = new Keyboard()
    screen.connect(keyboard)
  }

  def subscribe(producer: SourceQueueWithComplete[BinaryMessage]): Unit = {
    this.producer = producer
    // register some listeners
    EventBus.listenTo(classOf[BeepEvent], { case event: BeepEvent =>
      producer offer Packet.beep(event.frequency, event.duration)
    })
    EventBus.listenTo(classOf[BeepPatternEvent], { case event: BeepPatternEvent =>
      producer offer Packet.beepPattern(event.pattern)
    })
    EventBus.listenTo(classOf[MachineCrashEvent], { case event: MachineCrashEvent =>
      producer offer Packet.crash(event.message)
    })
    EventBus.listenTo(classOf[TextBufferSetEvent], { case event: TextBufferSetEvent =>
      producer offer Packet.set(event.x.toByte, event.y.toByte, event.vertical, event.value)
    })
    EventBus.listenTo(classOf[TextBufferSetForegroundColorEvent], { case event: TextBufferSetForegroundColorEvent =>
      producer offer Packet.foreground(event.color)
    })
    EventBus.listenTo(classOf[TextBufferSetBackgroundColorEvent], { case event: TextBufferSetBackgroundColorEvent =>
      producer offer Packet.background(event.color)
    })
    EventBus.listenTo(classOf[TextBufferCopyEvent], { case event: TextBufferCopyEvent =>
      producer offer Packet.copy(event.x.toByte, event.y.toByte, event.width.toByte, event.height.toByte,
        event.horizontalTranslation.toByte, event.verticalTranslation.toByte)
    })
    EventBus.listenTo(classOf[TextBufferFillEvent], { case event: TextBufferFillEvent =>
      producer offer Packet.fill(event.x.toByte, event.y.toByte, event.width.toByte, event.height.toByte, event.value)
    })
    EventBus.listenTo(classOf[TextBufferSetResolutionEvent], { case event: TextBufferSetResolutionEvent =>
      producer offer Packet.resolution(event.width.toByte, event.height.toByte)
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
    producer offer Packet.state(screen.data)
  }
}
