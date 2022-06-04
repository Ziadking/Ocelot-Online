package totoro.ocelot.online

import java.io.File
import java.net.InetSocketAddress
import java.time.{LocalDate, LocalDateTime}
import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.{ContentTypes, HttpEntity, HttpRequest, HttpResponse, StatusCodes, headers}
import akka.http.scaladsl.model.ws.{BinaryMessage, Message, TextMessage}
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.unmarshalling.Unmarshal
import akka.stream.scaladsl.{BroadcastHub, Flow, Keep, Sink, Source}
import akka.stream.{ActorMaterializer, OverflowStrategy}
import org.apache.logging.log4j.{LogManager, Logger}
import org.fusesource.scalate.TemplateEngine
import spray.json._
import DefaultJsonProtocol._
import totoro.ocelot.brain.user.User
import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.io.StdIn
import scala.language.postfixOps
import scala.util.{Failure, Success}
import java.time.format.DateTimeFormatter

object Ocelot {
  private val Name = "ocelot.online"
  // do not forget to change version in build.sbt
  private val Version = "0.4.0"
  private val OcelotProjId = 9941848
  var logger: Option[Logger] = None
  def log: Logger = logger.getOrElse(LogManager.getLogger(Name))

  def main(args: Array[String]): Unit = {
    // init
    implicit val system: ActorSystem = ActorSystem("ocelot-system")
    implicit val materializer: ActorMaterializer = ActorMaterializer()
    // needed for the future flatMap/onComplete in the end
    implicit val executionContext: ExecutionContextExecutor = system.dispatcher
    val templateSource = new File("template/index.mustache").getCanonicalPath
    val template = new TemplateEngine()
    val formatterOutput = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    val formaterInput = DateTimeFormatter.ISO_OFFSET_DATE_TIME

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

    def renderTemplate(lastUpdate: String = "A long time ago...",
                       updatedBy: String = "Totoro",
                       commit: String = "the latest commit",
                       commit_url: String = "https://gitlab.com/cc-ru/ocelot/ocelot-desktop"): HttpEntity.Strict = {
      val model = Map(
      "last_update" -> lastUpdate,
      "updated_by" -> updatedBy,
      "commit_url" -> commit_url,
      "commit" -> commit
      )

      HttpEntity(ContentTypes.`text/html(UTF-8)`, template.layout(templateSource, model))
    }

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
                case "mousewheel" => workspace.mouseScroll(parts(1).toInt, parts(2).toInt, parts(3).toFloat.toInt, user)
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
    def route(address: InetSocketAddress) =
      path("stream") {
        ignoreTrailingSlash {
          optionalHeaderValueByName("X-Real-Ip") { realIp =>
            val nickname = NameGen.name((address.toString + LocalDate.now.toString).hashCode)
            val ip = realIp match {
              case Some(ip) => ip
              case None => "NGINX proxy not configured"
            }
            val maskedIp = address.toString
            val banned = Settings.get.blacklist.exists(value => ip.contains(value) || maskedIp.contains(value))
            log.info(s"User connected: $nickname ($maskedIp / ${address.getAddress.getCanonicalHostName} / $ip${if (banned) " / banned" else ""})")
            if (!banned) handleWebSocketMessages(wsHandler(User(nickname))) else complete(HttpResponse(StatusCodes.PaymentRequired))
          }
        }
      } ~
        path("config.js") {
          get {
            complete(s"var version = '$Version'; var host = '${Settings.get.clientHost}';")
          }
        } ~
        ignoreTrailingSlash {
          path("desktop") {
            get {
              onComplete(
              Http()
                .singleRequest(HttpRequest(uri = s"https://gitlab.com/api/v4/projects/$OcelotProjId/jobs/")
                .withHeaders(headers.RawHeader("PRIVATE-TOKEN", Settings.get.gitlabToken))).flatMap {
                case HttpResponse(StatusCodes.OK, _, entity, _) => {
                      Unmarshal(entity).to[String]
                }
                case _ => {
                  Future.failed(new RuntimeException("Cannot parse json. Are you insane?"))
                }
              }) {
                case Success(jsonText) => {
                  val jsonAst = jsonText.parseJson
                  val jsonValue = jsonAst.convertTo[List[GitlabJob]].head.commit
                  val time = LocalDateTime.parse(jsonValue.authored_date, formaterInput)
                  complete(renderTemplate(time.format(formatterOutput), jsonValue.author_name,
                    jsonValue.short_id, jsonValue.web_url))
                }
                case _ => complete(renderTemplate())
              }
            }
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
