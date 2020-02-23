package totoro.ocelot.online.net

import java.nio.ByteOrder

import akka.http.scaladsl.model.ws.BinaryMessage
import akka.util.ByteString
import totoro.ocelot.brain.util.{GenericTextBuffer, PackedColor}

object Packet{
  private implicit val order: ByteOrder = ByteOrder.BIG_ENDIAN
  private val builder = ByteString.newBuilder

  object Type {
    val STATE: Byte = 1;
    val BEEP: Byte = 2;
    val BEEP_PATTERN: Byte = 3;
    val CRASH: Byte = 4;
    val SET: Byte = 5;
    val FOREGROUND: Byte = 6;
    val BACKGROUND: Byte = 7;
    val COPY: Byte = 8;
    val FILL: Byte = 9;
    val RESOLUTION: Byte = 10;
    val ONLINE: Byte = 11;
    val TURN_ON_RESULT: Byte = 12;
    val TURN_OFF_RESULT: Byte = 13;
  }

  private def init(len: Int, t: Byte): Unit = {
    builder.clear()
    builder.putInt(len)
    builder.putByte(t)
  }

  private def getColorInt(format: PackedColor.ColorFormat, value: PackedColor.Color): Int = {
    format.inflate(format.deflate(value))
  }

  def state(buffer: GenericTextBuffer): BinaryMessage = {
    val len = 10 + 10 * buffer.width * buffer.height
    init(len, Type.STATE)
    builder.putByte(buffer.width.toByte)
    builder.putByte(buffer.height.toByte)
    builder.putInt(getColorInt(buffer.format, buffer.foreground))
    builder.putInt(getColorInt(buffer.format, buffer.background))
    for (y <- 0 until buffer.height) {
      for (x <- 0 until buffer.width) {
        builder.putInt(PackedColor.unpackForeground(buffer.color(y)(x), buffer.format))
        builder.putInt(PackedColor.unpackBackground(buffer.color(y)(x), buffer.format))
        builder.putShort(buffer.buffer(y)(x))
      }
    }
    BinaryMessage.Strict(builder.result())
  }

  def beep(frequency: Short, duration: Short): BinaryMessage = {
    init(4, Type.BEEP)
    builder.putShort(frequency)
    builder.putShort(duration)
    BinaryMessage.Strict(builder.result())
  }

  def beepPattern(pattern: String): BinaryMessage = {
    init(pattern.length, Type.BEEP_PATTERN)
    pattern.foreach {
      case '-' => builder.putByte(1)
      case _ => builder.putByte(0)
    }
    BinaryMessage.Strict(builder.result())
  }

  def crash(message: String): BinaryMessage = {
    val messageEncoded = ByteString(message)
    init(messageEncoded.length, Type.CRASH)
    builder.append(messageEncoded)
    BinaryMessage.Strict(builder.result())
  }

  def set(x: Byte, y: Byte, vertical: Boolean, value: String): BinaryMessage = {
    val valueEncoded = ByteString(value)
    init(valueEncoded.length + 3, Type.SET)
    builder.putByte(x)
    builder.putByte(y)
    builder.putByte(if (vertical) 1 else 0)
    builder.append(valueEncoded)
    BinaryMessage.Strict(builder.result())
  }

  def foreground(color: Int): BinaryMessage = {
    init(4, Type.FOREGROUND)
    builder.putInt(color)
    BinaryMessage.Strict(builder.result())
  }

  def background(color: Int): BinaryMessage = {
    init(4, Type.BACKGROUND)
    builder.putInt(color)
    BinaryMessage.Strict(builder.result())
  }

  def copy(x: Byte, y: Byte, width: Byte, height: Byte, xTranslation: Byte, yTranslation: Byte): BinaryMessage = {
    init(6, Type.COPY)
    builder.putByte(x)
    builder.putByte(y)
    builder.putByte(width)
    builder.putByte(height)
    builder.putByte(xTranslation)
    builder.putByte(yTranslation)
    BinaryMessage.Strict(builder.result())
  }

  def fill(x: Byte, y: Byte, width: Byte, height: Byte, value: Char): BinaryMessage = {
    init(6, Type.FILL)
    builder.putByte(x)
    builder.putByte(y)
    builder.putByte(width)
    builder.putByte(height)
    builder.putShort(value)
    BinaryMessage.Strict(builder.result())
  }

  def resolution(width: Byte, height: Byte): BinaryMessage = {
    init(2, Type.RESOLUTION)
    builder.putByte(width)
    builder.putByte(height)
    BinaryMessage.Strict(builder.result())
  }

  def online(users: Short): BinaryMessage = {
    init(2, Type.ONLINE)
    builder.putShort(users)
    BinaryMessage.Strict(builder.result())
  }

  def turnOnResult(result: Boolean): BinaryMessage = {
    init(1, Type.TURN_ON_RESULT)
    builder.putByte(if (result) 1 else 0)
    BinaryMessage.Strict(builder.result())
  }

  def turnOffResult(result: Boolean): BinaryMessage = {
    init(1, Type.TURN_OFF_RESULT)
    builder.putByte(if (result) 1 else 0)
    BinaryMessage.Strict(builder.result())
  }
}
