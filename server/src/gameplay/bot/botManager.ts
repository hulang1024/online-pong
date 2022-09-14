import RoomManager from "../../room/roomManager";
import User from "../../user/user";
import { PlayerManager } from "../player";

export default class BotManager {
  botUserId = -1;

  constructor(roomManager: RoomManager, playerManager: PlayerManager) {
    roomManager.onJoin = (roomId: number) => {
      const botUser = new User(this.botUserId--);
      roomManager.join(botUser, roomId, playerManager);
      const botPlayer = playerManager.get(botUser.id)!;
      botPlayer.isReadyRecvFrame = true;
    };
  }
}