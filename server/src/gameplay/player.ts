import { WebSocket } from "ws";
import Room from "../room/room";
import User from "../user/user";
import Game from "./game";

// 玩家，表示对局中的用户的玩家状态
export default class Player {
  id: number;
  user: User = User.Null;
  client: WebSocket | null = null;
  teamId = 0;
  room: Room = Room.Null;
  game: Game | null = null;
  isReadyRecvFrame = false;
  //每个输入：<帧号(3B)><输入信息(1B)>
  frameInputQueue: number[][] = [];
  
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
    if (this.client?.readyState == 1) {
      this.client.send(data);
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

  delete(id: number) {
    this.players.delete(id);
  }
}