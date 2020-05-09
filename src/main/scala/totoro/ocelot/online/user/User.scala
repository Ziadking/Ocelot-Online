package totoro.ocelot.online.user

import totoro.ocelot.brain.user.{User => BrainUser}

/**
  * Represents a user of Ocelot.Online.
  */

class User(
  val id: Int,
  override val nickname: String,
  val password: String,
  val email: String,
  val guest: Boolean = false
) extends BrainUser(nickname)
