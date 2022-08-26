import Player from "../play/player";
import User, { NullUser } from "../user";

let RoomId = 10;

export default class Room {
  id: number;
  creator: User = NullUser;
  createAt: number = 0;
  players: Player[] = [];

  constructor() {
    this.id = RoomId++;
  }

  join(player: Player) {
    player.room = this;
    this.players.push(player);
    this.players.sort((a, b) => a.id - b.id);
  }

  part(player: Player) {
    this.players = this.players.filter((p) => p != player);
  }
}

export class RoomManager {
  rooms = new Map<number, Room>();

  create() {
    const room = new Room();
    this.rooms.set(room.id, room);
    return room;
  }

  get(id: number) {
    return this.rooms.get(id);
  }
}

export const NullRoom = new Room();