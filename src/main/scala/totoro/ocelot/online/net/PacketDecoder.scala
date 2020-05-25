package totoro.ocelot.online.net

import akka.http.scaladsl.model.ws.BinaryMessage
import totoro.ocelot.online.net.packet._

/**
  * A big switch that matches packet IDs with packet Classes.
  */

object PacketDecoder {
  def decode(message: BinaryMessage.Strict): Packet = {
    import PacketTypes._

    val buffer = message.data.asByteBuffer
    val packetType = buffer.get()

    (packetType match {
      // general
      case SUCCESS => new PacketSuccess()
      case FAIL => new PacketFail()
      case GET_ONLINE => new PacketGetOnline()
      case ONLINE => new PacketOnline()
      case MOUSE => new PacketMouse()

      // user related
      case REGISTER => new PacketRegister()
      case LOGIN => new PacketLogin()
      case USER_GET_DETAILS => new PacketUserGetDetails()
      case USER_DETAILS => new PacketUserDetails()
      case USER_DELETE => new PacketUserDelete()

      // workspace related
      case WORKSPACE_CREATE => new PacketWorkspaceCreate()
      case WORKSPACE_RENAME => new PacketWorkspaceRename()
      case WORKSPACE_DELETE => new PacketWorkspaceDelete()
      case WORKSPACE_GET_DESCRIPTION => new PacketWorkspaceGetDescription()
      case WORKSPACE_DESCRIPTION => new PacketWorkspaceDescription()
      case WORKSPACE_GET_LIST => new PacketWorkspaceGetList()
      case WORKSPACE_LIST => new PacketWorkspaceList()
      case WORKSPACE_GET_PERMISSIONS => new PacketWorkspaceGetPermissions()
      case WORKSPACE_PERMISSIONS => new PacketWorkspacePermissions()
      case WORKSPACE_GET_STATE => new PacketWorkspaceGetState()
      case WORKSPACE_STATE => new PacketWorkspaceState()

      // TODO: the rest of the protocol must be here

    }).decode(buffer)
  }
}
