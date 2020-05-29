package totoro.ocelot.online

import java.io.File
import java.net.InetSocketAddress
import java.time.LocalDate

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model._
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.stream.OverflowStrategy
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, Sink, Source}
import org.apache.logging.log4j.{LogManager, Logger}
import totoro.ocelot.online.net.{PacketDecoder, PacketTypes}
import totoro.ocelot.online.net.packet.{PacketBlockMove, PacketBlockToggleFold, PacketBlockTogglePower, PacketFail, PacketOnline, PacketUserDetails, PacketWorkspaceGetState, PacketWorkspaceList, PacketWorkspaceState}
import totoro.ocelot.online.user.User
import totoro.ocelot.online.util.{IdGen, NameGen}
import totoro.ocelot.online.workspace.WorkspaceDescription

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
    var online: Int = 0

    def watchDisconnectsFlow[T]: Flow[T, T, Any] = Flow[T]
      .watchTermination()((_, f) => {
        online = online + 1
        mat offer new PacketOnline(0, online).asMessage()
        f.onComplete { result =>
          online = online - 1
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
        case bm: BinaryMessage.Strict =>
          if (Settings.get.serverDebug) log.debug(s">:> $bm")
          val packet = PacketDecoder.decode(bm)
          packet.packetType match {
            case PacketTypes.GET_ONLINE =>
              new PacketOnline(0, online).asMessage() :: Nil
            case PacketTypes.WORKSPACE_GET_LIST =>
              new PacketWorkspaceList(
                packet.thread,
                universe.workspaces.map(workspace => WorkspaceDescription(workspace.id, workspace.name, workspace.description))
              ).asMessage() :: Nil
            case PacketTypes.USER_GET_DETAILS =>
              new PacketUserDetails(packet.thread, user.id, user.nickname, user.email)
                .asMessage() :: Nil
            case PacketTypes.MOUSE =>
              mat offer bm
              Nil
            case PacketTypes.WORKSPACE_GET_STATE =>
              val id = packet.asInstanceOf[PacketWorkspaceGetState].id
              val workspace = universe.workspace(id)
              (workspace match {
                case Some(w) => new PacketWorkspaceState(packet.thread, w).asMessage()
                case None => new PacketFail(packet.thread, s"No workspace with ID: $id exists.").asMessage()
              }) :: Nil
            case PacketTypes.BLOCK_MOVE =>
              val parsed = packet.asInstanceOf[PacketBlockMove]
              universe.workspace(0).foreach(w => w.moveBlock(parsed.id, parsed.x, parsed.y))
              mat offer bm
              Nil
            case PacketTypes.BLOCK_TOGGLE_FOLD =>
              val parsed = packet.asInstanceOf[PacketBlockToggleFold]
              universe.workspace(0).foreach(w => w.foldBlock(parsed.id, parsed.folded))
              mat offer bm
              Nil
            case PacketTypes.BLOCK_TOGGLE_POWER =>
              val parsed = packet.asInstanceOf[PacketBlockTogglePower]
              universe.workspace(0).foreach(w => w.turnOnBlock(parsed.id, parsed.powered))
              mat offer bm
              Nil
            case _ =>
              if (Settings.get.serverDebug) log.info(s"Incoming packet ignored: $packet")
              Nil
          }
        case _ => Nil
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
              if (!banned) {
                val user = new User(IdGen.id(), nickname, "betternot", "noreply@fomalhaut.me", guest = true)
                handleWebSocketMessages(wsHandler(user))
              } else complete(HttpResponse(StatusCodes.PaymentRequired))
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

    log.info(s"Server online at http://${Settings.get.serverHost}:${Settings.get.serverPort}/\nEnter 'stop' to shutdown...")
    while (StdIn.readLine().toLowerCase() != "stop") {}

    // stop
    bindingFuture
      .onComplete(_ => system.terminate())

    universe.stop()
    universe.dispose()

    log.info("Bye...")
  }
}
