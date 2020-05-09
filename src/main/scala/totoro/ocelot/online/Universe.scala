package totoro.ocelot.online

import totoro.ocelot.brain.{Ocelot => Brain}
import totoro.ocelot.online.user.User
import totoro.ocelot.online.workspace.Workspace

import scala.collection.mutable.ListBuffer

class Universe {
  val workspaces: ListBuffer[Workspace] = ListBuffer.empty
  var thread: Thread = _

  val admin = new User(0, "totoro", "betternot", "dmitry.zhidenkov@gmail.com")

  def init(): Unit = {
    Ocelot.log.info("Universe initialization...")

    // initialize demo workspace
    val demospace = new Workspace("Public Sandbox", admin)
    // TODO: init demo workspace here

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
    // init brain
    Brain.initialize()
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
