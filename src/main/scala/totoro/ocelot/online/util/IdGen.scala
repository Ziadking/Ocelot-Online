package totoro.ocelot.online.util

/**
  * Temporary contraption for unique ID generation.
  */

object IdGen {
  private var lastUsedId = 0;

  def id(): Int = this.synchronized {
    lastUsedId += 1
    lastUsedId
  }
}
