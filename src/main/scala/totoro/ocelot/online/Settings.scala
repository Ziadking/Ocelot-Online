package totoro.ocelot.online

import java.io.File

import com.typesafe.config.{Config, ConfigFactory}

class Settings(val config: Config) {
  val serverHost: String = config.getString("server.host")
  val serverPort: Int = config.getInt("server.port")
  val clientHost: String = config.getString("client.host")
}

object Settings {
  private var settings: Settings = _
  def get: Settings = settings

  def load(file: File): Unit = {
    settings = new Settings(ConfigFactory.parseFile(file))
  }
}
