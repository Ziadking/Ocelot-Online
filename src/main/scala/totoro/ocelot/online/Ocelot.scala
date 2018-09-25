package totoro.ocelot.online

import java.io.File

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.{ActorMaterializer, OverflowStrategy}
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, Sink, Source}

import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn
import scala.util.Success

object Ocelot {
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
        println("Main thread closed...")
      }).start()
      println("Created new main thread.")
    }
    run()

    // create websockets handler
    def wsHandler: Flow[Message, Message, Any] =
      Flow[Message].mapConcat {
        case tm: TextMessage =>
          tm.textStream.runFold("")(_ + _).onComplete {
            case Success(message) =>
              val parts = message.split(" ")
              parts.head match {
                case "keydown" => workspace.keyDown(parts(1).toInt.toChar, parts(2).toInt)
                case "keyup" => workspace.keyUp(parts(1).toInt.toChar, parts(2).toInt)
                case "state" => workspace.sendState()
                case "turnon" =>
                  if (!workspace.isRunning) {
                    workspace.turnOn()
                    run()
                    mat offer TextMessage("turnon-success")
                  } else {
                    mat offer TextMessage("turnon-failure")
                  }
              }
            case _ =>
          }
          Nil
        case bm: BinaryMessage =>
          // ignore binary messages but drain content to avoid the stream being clogged
          bm.dataStream.runWith(Sink.ignore)
          Nil
      }.merge(source)

    // define routes
    val route =
      path("stream") {
        ignoreTrailingSlash {
          handleWebSocketMessages(wsHandler)
        }
      } ~
      path("config.js") {
        get {
          complete(s"var host = '${Settings.get.clientHost}';")
        }
      } ~
      pathEndOrSingleSlash {
        getFromFile("static/index.html")
      } ~
      getFromDirectory("static")

    // run
    val bindingFuture = Http().bindAndHandle(route, Settings.get.serverHost, Settings.get.serverPort)

    println(s"Server online at http://${Settings.get.serverHost}:${Settings.get.serverPort}/\nPress Enter to stop...")
    StdIn.readLine()
    bindingFuture
      .flatMap(_.unbind())
      .onComplete(_ => system.terminate())

    workspace.turnOff()
  }
}
