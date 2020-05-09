package totoro.ocelot.online.user.permission

import java.nio.{ByteBuffer, ByteOrder}

import akka.util.ByteStringBuilder
import totoro.ocelot.online.util.BinaryHelper

/**
  * What user can or can't do with a workspace.
  */

case class Permission(target: PermissionTarget, flag: Int) {
  private implicit val DefaultOrder: ByteOrder = BinaryHelper.DefaultOrder

  def encode(builder: ByteStringBuilder): Unit = {
    target.encode(builder)
    builder.putInt(flag)
  }
}

object Permission {
  def decode(data: ByteBuffer): Permission = {
    val target = PermissionTarget.decode(data)
    val flag = data.getInt()
    Permission(target, flag)
  }
}
