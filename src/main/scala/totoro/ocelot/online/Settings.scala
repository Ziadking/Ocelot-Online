package totoro.ocelot.online

import java.io.File
import java.util.concurrent.TimeUnit

import com.typesafe.config.{Config, ConfigFactory}

import scala.collection.mutable
import scala.concurrent.duration.FiniteDuration
import scala.jdk.CollectionConverters._

class Settings(val config: Config) {
  val serverHost: String = config.getString("server.host")
  val serverPort: Int = config.getInt("server.port")
  val serverBlacklist: mutable.Buffer[String] = config.getStringList("server.blacklist").asScala
  val serverTimeout: FiniteDuration = FiniteDuration(config.getInt("server.timeout"), TimeUnit.MILLISECONDS)

  val clientHost: String = config.getString("client.host")
}

object Settings {
  private var settings: Settings = _

  def get: Settings = settings

  def load(file: File): Unit = {
    settings = new Settings(ConfigFactory.parseFile(file))
  }
}
