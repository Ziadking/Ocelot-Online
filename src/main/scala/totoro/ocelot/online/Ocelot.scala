package totoro.ocelot.online

import java.io.File
import java.net.InetSocketAddress
import java.time.LocalDate

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.http.scaladsl.model._
import akka.http.scaladsl.server.Directives._
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, Sink, Source}
import akka.stream.OverflowStrategy
import org.apache.logging.log4j.{LogManager, Logger}
import totoro.ocelot.brain.user.User
import totoro.ocelot.online.net.packet.PacketOnline

import scala.concurrent.ExecutionContextExecutor
import scala.io.StdIn
import scala.util.Failure

object Ocelot {
  private val Name = "ocelot.online"
  // do not forget to change version in build.sbt
  private val Version = "0.3.11"

  private val universe = new Universe()

  var logger: Option[Logger] = None
  def log: Logger = logger.getOrElse(LogManager.getLogger(Name))

  def main(args: Array[String]): Unit = {
    // init
    log.info("Ocelot.Online initialization...")
    log.info(s"Version: $Version")

    implicit val system: ActorSystem = ActorSystem("ocelot-system")
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher // for our futures

    Settings.load(new File("ocelot.conf"))

    // create a broadcast Source
    val queue = Source.queue[BinaryMessage](bufferSize = 256, OverflowStrategy.dropHead)
    val (mat, source) = queue.toMat(BroadcastHub.sink(bufferSize = 256))(Keep.both).run()
    source.runWith(Sink.ignore)

    // init emulator
    universe.init()

    // create websockets handler
    var online: Short = 0

    def watchDisconnectsFlow[T]: Flow[T, T, Any] = Flow[T]
      .watchTermination()((_, f) => {
        online = (online + 1).toShort
        mat offer new PacketOnline(0, online).asMessage()
        f.onComplete { result =>
          online = (online - 1).toShort
          mat offer new PacketOnline(0, online).asMessage()
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
          // ignore text messages but drain content to avoid the stream being clogged
          tm.textStream.runWith(Sink.ignore)
          Nil
        case bm: BinaryMessage =>
          bm.toStrict(Settings.get.serverTimeout).onComplete(message => {
            // TODO: parse binary messages here
            println(message)
          })
          Nil
      }
      .merge(source)
      .via(watchDisconnectsFlow)

    // define routes
    def route(address : InetSocketAddress) =
      path("stream") {
        ignoreTrailingSlash {
            optionalHeaderValueByName("X-Real-Ip") { realIp =>
              val nickname = NameGen.name((address.toString + LocalDate.now.toString).hashCode)
              val ip = realIp match {
                case Some(ip) => ip
                case None => "NGINX proxy not configured"
              }
              val maskedIp = address.toString
              val banned = Settings.get.serverBlacklist.exists(value => ip.contains(value) || maskedIp.contains(value))
              log.info(s"User connected: $nickname ($maskedIp / ${address.getAddress.getCanonicalHostName} / $ip${ if (banned) " / banned" else "" })")
              if (!banned) handleWebSocketMessages(wsHandler(User(nickname))) else complete(HttpResponse(StatusCodes.PaymentRequired))
            }
        }
      } ~
      path("config.js") {
        get {
          complete {
            HttpResponse(entity = HttpEntity(ContentType(MediaTypes.`application/javascript`, HttpCharsets.`UTF-8`),
              s"var version = '$Version'; var host = '${Settings.get.clientHost}';"))
          }
        }
      } ~
      pathEndOrSingleSlash {
        getFromFile("static/index.html")
      } ~
      getFromDirectory("static")


    // run
    universe.run()

    val bindingFuture = Http()
      .bind(Settings.get.serverHost, Settings.get.serverPort)
      .runWith(Sink foreach { conn =>
        val address = conn.remoteAddress
        conn.handleWith(route(address))
      })

    log.info(s"Server online at http://${Settings.get.serverHost}:${Settings.get.serverPort}/\nPress Enter to stop...")
    StdIn.readLine()

    // stop
    bindingFuture
      .onComplete(_ => system.terminate())

    universe.stop()
    universe.dispose()

    log.info("Bye...")
  }
}
