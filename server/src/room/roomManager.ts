import { GameState } from "../gameplay/game";
import Player, { PlayerManager } from "../gameplay/player";
import User from "../user/user";
import Room from "./room";

export default class RoomManager {
  rooms = new Map<number, Room>();
  onJoin = (roomId: number) => {};

  create() {
    const room = new Room();
    this.rooms.set(room.id, room);
    return room;
  }

  /**
   * 加入房间以游戏
   * @param user 要加入的用户
   * @param roomId 房间id
   * @returns 1=房间不存在、2=已满、3=游戏已开始、0=成功
   */
  join(user: User, roomId: number, playerManager: PlayerManager) {
    // 房间是否存在
    const room = this.get(roomId);
    if (room == null) {
      return 1;
    }

    if (room.isFull()) {
      return 2;
    }

    if (room.game && room.game.state != GameState.Ready) {
      return 3;
    }

    // 加入后成为 Player
    let player = playerManager.get(user.id);
    if (!player) {
      player = new Player(user);
      playerManager.add(player);
    }

    if (player.joinedRoom()) {
      if (player.room.id == roomId) {
        return 0;
      }
      // 退出已加入的其它房间
      player.room.part(player);
    }

    // 加入
    room.join(player);

    if (!player.isBot()) {
      this.onJoin(roomId);
    }

    return 0;
  }

  part(user: User, roomId: number, playerManager: PlayerManager) {
    const room = this.get(roomId);
    if (room == null) {
      return 1;
    }

    const player = playerManager.get(user.id);
    if (player && player.room.id == room.id) {
      room.part(player);
      playerManager.delete(player.id);
      player.quitGame();
      return 0;
    } else {
      return 1;
    }
  }

  get(id: number) {
    return this.rooms.get(id);
  }

  delete(room: Room, playerManager: PlayerManager) {
    room.players.forEach((player) => {
      playerManager.delete(player.id);
    });
    return this.rooms.delete(room.id);
  }
}