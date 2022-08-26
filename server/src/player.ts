import { WebSocket } from "ws";
import Room, { NullRoom } from "./room";

export default class Player {
  id: number;
  client: WebSocket;
  room: Room = NullRoom;
  // 1个操作帧：32位：高8位记录输入操作，低24位记录帧号
  frames: number[] = [];

  constructor(id: number, client: WebSocket) {
    this.id = id;
    this.client = client;
  }
}

export class PlayerManager {
  players: Player[] = [];
  idToPlayer: Map<number, Player> = new Map();

  add(player: Player) {
    this.players.push(player);
    this.idToPlayer.set(player.id, player);
  }

  get(key: number) {
    return this.idToPlayer.get(key as number);
  }
  
  count() {
    return this.idToPlayer.size;
  }
}