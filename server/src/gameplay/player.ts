import { WebSocket } from "ws";
import Room from "../room/room";
import User from "../user/user";
import Game from "./game";

// 玩家，表示对局中的用户的玩家状态
export default class Player {
  id: number;
  user: User = User.Null;
  client: WebSocket | null = null;
  room: Room = Room.Null;
  game: Game | null = null;
  // 1个操作帧：32位：高8位记录输入操作，低24位记录帧号
  frames: number[] = [];
  
  constructor(user: User) {
    this.id = user.id;
    this.user = user;
  }

  joinedRoom() {
    return this.room != Room.Null;
  }

  quitGame() {
    this.game = null;
  }

  isOnline() {
    return this.client?.readyState == 1;
  }

  send(data: any) {
    if (this.client!.readyState == 1) {
      this.client!.send(data);
    }
  }
}

export class PlayerManager {
  players: Map<number, Player> = new Map();

  add(player: Player) {
    this.players.set(player.id, player);
  }

  get(id: number) {
    return this.players.get(id);
  }

  del(id: number) {
    this.players.delete(id);
  }
}