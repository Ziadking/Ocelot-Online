package totoro.ocelot.online.net.packet

import java.nio.{ByteBuffer, ByteOrder}

import akka.http.scaladsl.model.ws.BinaryMessage
import akka.util.{ByteString, ByteStringBuilder}
import totoro.ocelot.online.net.PacketTypes.PacketType
import totoro.ocelot.online.util.BinaryHelper

/**
  * Packet header format:
  * 1b           4b
  * <packet-type><thread-id><body>
  *
  * Packet Type: distinct ID is assigned to any distinct piece of protocol.
  * Thread ID:   requesting side can provide an ID and the answer must contain the same ID
  *              (pass 0 here if you do not need a thread ID)
  */

abstract class Packet {
  protected implicit val order: ByteOrder = BinaryHelper.DefaultOrder

  var packetType: PacketType
  var thread: Int = 0

  /**
    * Encodes the content of this Packet in the given byte string builder.
    * @param builder the builder
    * @return the same builder instance (for chaining)
    */
  def encode(builder: ByteStringBuilder): ByteStringBuilder = {
    builder.putByte(packetType)
    builder.putInt(thread)
    builder
  }

  /**
    * Convenience method that will build a [[BinaryMessage]] from this Packet
    */
  def asMessage(): BinaryMessage.Strict = {
    BinaryMessage.Strict(encode(ByteString.newBuilder).result())
  }

  /**
    * Inits all Packet fields with values from the `data` buffer.
    * @param data the raw byte buffer with encoded Packet
    * @param withType if true, the first byte of `data` must be packet type
    * @return this Packet
    */
  def decode(data: ByteBuffer, withType: Boolean = false): Packet = {
    if (withType) {
      packetType = data.get()
    }
    thread = data.getInt()
    this
  }
}
