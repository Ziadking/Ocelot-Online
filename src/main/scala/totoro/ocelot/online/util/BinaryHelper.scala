package totoro.ocelot.online.util

import java.nio.{ByteBuffer, ByteOrder}
import java.nio.charset.{Charset, StandardCharsets}

import akka.util.ByteStringBuilder

object BinaryHelper {
  implicit val DefaultOrder: ByteOrder = ByteOrder.BIG_ENDIAN
  val DefaultCharset: Charset = StandardCharsets.UTF_8

  /**
    * Encodes string value into the given ByteString builder.
    * @param withLen if true, two additional bytes will be written at the beginning,
    *                encoding the length of the value in bytes
    */
  def encodeString(builder: ByteStringBuilder, value: String, withLen: Boolean = false): ByteStringBuilder = {
    val bytes = value.getBytes(DefaultCharset)
    if (withLen) {
      builder.putShort(bytes.length)
    }
    builder.putBytes(bytes)
    builder
  }

  /**
    * Decodes a string value from byte buffer.
    * @param data the raw source data
    * @param withLen if true, the first two bytes are supposedly the encoded length of the string value
    * @return the decoded string
    */
  def decodeString(data: ByteBuffer, withLen: Boolean = false): String = {
    if (withLen) {
      val len = data.getShort()
      val array = new Array[Byte](len)
      data.get(array, data.position, len)
      new String(array, DefaultCharset)
    } else {
      val slice = data.slice()
      data.position(data.position() + slice.limit()) // do not forget to move the position
      DefaultCharset.decode(slice).toString
    }
  }
}
