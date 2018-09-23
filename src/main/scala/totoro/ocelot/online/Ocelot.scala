package totoro.ocelot.online

import java.io.File

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, Sink, Source}

import scala.concurrent.ExecutionContextExecutor
import scala.concurrent.duration._
import scala.io.StdIn

object Ocelot {
  def main(args: Array[String]): Unit = {
    // init
    implicit val system: ActorSystem = ActorSystem("ocelot-system")
    implicit val materializer: ActorMaterializer = ActorMaterializer()
    // needed for the future flatMap/onComplete in the end
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher

    Settings.load(new File("ocelot.conf"))

    // demo source
    val source = Source.tick(1.seconds, 1.seconds, TextMessage("meow"))
    val runnableGraph = source.toMat(BroadcastHub.sink(bufferSize = 256))(Keep.right)
    val producer = runnableGraph.run()

    producer.runWith(Sink.ignore)

    // create websockets handler
    def wsHandler: Flow[Message, Message, Any] =
      Flow[Message].mapConcat {
        case tm: TextMessage =>
          TextMessage(tm.textStream ++ Source.single(" to you too!")) :: Nil
        case bm: BinaryMessage =>
          // ignore binary messages but drain content to avoid the stream being clogged
          bm.dataStream.runWith(Sink.ignore)
          Nil
      }.merge(producer)

    // define routes
    val route =
      path("stream") {
        ignoreTrailingSlash {
          handleWebSocketMessages(wsHandler)
        }
      } ~
      path("config.js") {
        get {
          complete(s"var host = '${Settings.get.clientHost}'; var port = ${Settings.get.clientPort};")
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
  }
}
