package totoro.ocelot.online

import totoro.ocelot.brain.entity.{CPU, Case, GraphicsCard, HDDManaged, HDDUnmanaged, InternetCard, Keyboard, Memory, Redstone, Screen}
import totoro.ocelot.brain.loot.Loot
import totoro.ocelot.brain.util.Tier
import totoro.ocelot.brain.{Ocelot => Brain}
import totoro.ocelot.online.user.User
import totoro.ocelot.online.util.IdGen
import totoro.ocelot.online.workspace.Workspace
import totoro.ocelot.online.workspace.block.{BlockCase, BlockScreen}

import scala.collection.mutable.ListBuffer

class Universe {
  val workspaces: ListBuffer[Workspace] = ListBuffer.empty
  var thread: Thread = _

  val admin = new User(0, "totoro", "betternot", "dmitry.zhidenkov@gmail.com")

  def init(): Unit = {
    Brain.initialize()
    Ocelot.log.info("Universe initialization...")

    // -------------------------------------------------------------------------------------------------------------- //
    // initialize demo workspace
    val demospace = new Workspace(0, "Public Sandbox", admin)

    val blockCase = new BlockCase(IdGen.id(), 0, 0, Tier.Four)
    demospace.add(blockCase)

    val blockScreen = new BlockScreen(IdGen.id(), 100, 0, Tier.Two)
    demospace.add(blockScreen)

    demospace.connect(blockCase, blockScreen)
    // -------------------------------------------------------------------------------------------------------------- //

    // create main update thread
    thread = new Thread {
      override def run() {
        while (true) {
          try {
            workspaces.foreach(_.update())
            Thread.sleep(50)
          } catch {
            case _: InterruptedException =>
              Ocelot.log.info("Universe stopped.")
              return
            case e: Throwable => Ocelot.log.error("Something happened in the Universe main loop!", e)
          }
        }
      }
    }
  }

  def run(): Unit = {
    if (thread != null){
      thread.start()
      Ocelot.log.info("Universe started.")
    }
  }

  def stop(): Unit = {
    if (thread != null) {
      thread.interrupt()
      Ocelot.log.info("Universe interrupted...")
    }
  }

  def dispose(): Unit = {
    Brain.shutdown()
  }
}
