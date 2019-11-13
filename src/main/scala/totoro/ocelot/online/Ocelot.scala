package totoro.ocelot.online

import java.io.File
import java.net.InetSocketAddress
import java.time.LocalDate

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, Sink, Source}
import akka.stream.{ActorMaterializer, OverflowStrategy}
import org.apache.logging.log4j.{LogManager, Logger}
import totoro.ocelot.brain.user.User

import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn
import scala.util.{Failure, Success}

object Ocelot {
  private val Name = "ocelot.online"
  // do not forget to change version in build.sbt
  private val Version = "0.3.10"

  var logger: Option[Logger] = None
  def log: Logger = logger.getOrElse(LogManager.getLogger(Name))

  def main(args: Array[String]): Unit = {
    // init
    implicit val system: ActorSystem = ActorSystem("ocelot-system")
    implicit val materializer: ActorMaterializer = ActorMaterializer()
    // needed for the future flatMap/onComplete in the end
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher

    Settings.load(new File("ocelot.conf"))

    // demo source
    val queue = Source.queue[TextMessage](256, OverflowStrategy.dropHead)
    val (mat, source) = queue.toMat(BroadcastHub.sink(bufferSize = 256))(Keep.both).run()
    source.runWith(Sink.ignore)

    // init demo workspace
    val workspace = new Workspace()
    workspace.init()
    workspace.subscribe(mat)

    workspace.turnOn()

    def run(): Unit = {
      new Thread(() => {
        while (workspace.isRunning) {
          workspace.update()
          Thread.sleep(50)
        }
        log.debug("Main thread closed...")
      }).start()
      log.debug("Created new main thread.")
    }
    run()

    // create websockets handler
    var online = 0

    def watchDisconnectsFlow[T]: Flow[T, T, Any] = Flow[T]
      .watchTermination()((_, f) => {
        online += 1
        mat offer TextMessage(s"online\n$online")
        f.onComplete { result =>
          online -= 1
          mat offer TextMessage(s"online\n$online")
          result match {
            case Failure(cause) =>
              log.error(s"WS stream failed!", cause)
            case _ => // ignore normal termination
          }
        }
      })

    def wsHandler(user: User): Flow[Message, Message, Any] = Flow[Message]
      .mapConcat {
        case tm: TextMessage =>
          tm.textStream.runFold("")(_ + _).onComplete {
            case Success(message) =>
              val parts = message.split(" ")
              parts.head match {
                case "keydown" => workspace.keyDown(parts(1).toInt.toChar, parts(2).toInt, user)
                case "keyup" => workspace.keyUp(parts(1).toInt.toChar, parts(2).toInt, user)
                case "keyup-all" => workspace.releasePressedKeys(user)
                case "clipboard" => workspace.clipboard(message.drop(10), user)
                case "mousedown" => workspace.mouseDown(parts(1).toInt, parts(2).toInt, parts(3).toInt, user)
                case "mouseup" => workspace.mouseUp(parts(1).toInt, parts(2).toInt, parts(3).toInt, user)
                case "mousedrag" => workspace.mouseDrag(parts(1).toInt, parts(2).toInt, parts(3).toInt, user)
                case "mousewheel" => workspace.mouseScroll(parts(1).toInt, parts(2).toInt, parts(3).toInt, user)
                case "state" => workspace.sendState()
                case "turnon" =>
                  if (!workspace.isRunning) {
                    workspace.turnOn()
                    run()
                    mat offer TextMessage("turnon-success")
                  } else {
                    mat offer TextMessage("turnon-failure")
                  }
                case "turnoff" =>
                  if (workspace.isRunning) {
                    workspace.turnOff()
                    mat offer TextMessage("turnoff-success")
                  } else {
                    mat offer TextMessage("turnoff-failure")
                  }
                case "online" =>
                  mat offer TextMessage(s"online\n$online")
                case _ => // pass
              }
            case _ =>
          }
          Nil
        case bm: BinaryMessage =>
          // ignore binary messages but drain content to avoid the stream being clogged
          bm.dataStream.runWith(Sink.ignore)
          Nil
      }
      .merge(source)
      .via(watchDisconnectsFlow)


    // define routes
    def route(address : InetSocketAddress) =
      path("stream") {
        ignoreTrailingSlash {
          val nickname = NameGen.name((address.toString + LocalDate.now.toString).hashCode)
          log.info(s"User connected: $nickname ($address / ${address.getAddress.getCanonicalHostName})")
          handleWebSocketMessages(wsHandler(User(nickname)))
        }
      } ~
      path("config.js") {
        get {
          complete(s"var version = '$Version'; var host = '${Settings.get.clientHost}';")
        }
      } ~
      pathEndOrSingleSlash {
        getFromFile("static/index.html")
      } ~
      getFromDirectory("static")


    // run
    val bindingFuture = Http()
      .bind(Settings.get.serverHost, Settings.get.serverPort)
      .runWith(Sink foreach { conn =>
        val address = conn.remoteAddress
        conn.handleWith(route(address))
      })

    log.info(s"Server online at http://${Settings.get.serverHost}:${Settings.get.serverPort}/\nPress Enter to stop...")
    StdIn.readLine()
    bindingFuture
      .onComplete(_ => system.terminate())

    workspace.turnOff()
  }
}
