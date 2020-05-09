package totoro.ocelot.online.user.permission

import java.nio.{ByteBuffer, ByteOrder}

import akka.util.ByteStringBuilder
import totoro.ocelot.online.user.User
import totoro.ocelot.online.util.BinaryHelper


sealed abstract class PermissionTarget {
  val id: Byte

  def includes(target: User): Boolean

  def encode(builder: ByteStringBuilder): Unit = {
    builder.putByte(id)
  }
}


sealed class TargetAll extends PermissionTarget {
  override val id: Byte = 0
  override def includes(target: User): Boolean = true
}

sealed class TargetAllGuests extends PermissionTarget {
  override val id: Byte = 1
  override def includes(target: User): Boolean = target.guest
}

sealed class TargetAllRegistered extends PermissionTarget {
  override val id: Byte = 2
  override def includes(target: User): Boolean = !target.guest
}

sealed class TargetUser(val userId: Int) extends PermissionTarget {
  private implicit val order: ByteOrder = BinaryHelper.DefaultOrder

  override val id: Byte = 3
  override def includes(target: User): Boolean = target.id == userId

  override def encode(builder: ByteStringBuilder): Unit = {
    super.encode(builder)
    builder.putInt(userId)
  }
}


object PermissionTarget {
  def decode(data: ByteBuffer): PermissionTarget = {
    val id = data.get()
    id match {
      case 0 => new TargetAll()
      case 1 => new TargetAllGuests()
      case 2 => new TargetAllRegistered()
      case 3 =>
        val userId = data.getInt()
        new TargetUser(userId)
    }
  }
}
