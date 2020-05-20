package totoro.ocelot.online.workspace

import java.nio.{ByteBuffer, ByteOrder}

import akka.util.ByteStringBuilder
import totoro.ocelot.online.util.BinaryHelper

/**
  * Auxiliary data class for network requests.
  */

case class WorkspaceDescription(var id: Int, var name: String, var description: String) {
  implicit val DefaultOrder: ByteOrder = BinaryHelper.DefaultOrder

  def encode(builder: ByteStringBuilder): Unit = {
    builder.putInt(id)
    BinaryHelper.encodeString(builder, name, withLen = true)
    BinaryHelper.encodeString(builder, description, withLen = true)
  }
}

object WorkspaceDescription {
  def decode(data: ByteBuffer): WorkspaceDescription = {
    val id = data.getInt()
    val name = BinaryHelper.decodeString(data, withLen = true)
    val description = BinaryHelper.decodeString(data, withLen = true)
    WorkspaceDescription(id, name, description)
  }
}
