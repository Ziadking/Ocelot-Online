package totoro.ocelot.online.net.packet

import java.nio.ByteBuffer

import akka.util.ByteStringBuilder
import totoro.ocelot.online.net.PacketType

/**
  * Util packet that tells the number of people currently online.
  * Frontend listens to it to show a corresponding indicator.
  *
  * No response is expected.
  *
  * Packet format:
  * 4b
  * <number>
  */

class PacketOnline extends PacketSingleID {
  override var packetType: Byte = PacketType.ONLINE

  def this(thread: Int, number: Int) {
    this()
    this.thread = thread
    this.id = number
  }
}
