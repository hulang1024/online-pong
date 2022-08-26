import Player from "./player";

let RoomId = 10;

export default class Room {
  id: number;
  players: Player[] = [];

  constructor() {
    this.id = RoomId++;
  }

  add(player: Player) {
    player.room = this;
    this.players.push(player);
    this.players.sort((a, b) => a.id - b.id);
  }
}

export class RoomManager {
  rooms: Set<Room> = new Set();

  create() {
    const room = new Room();
    this.rooms.add(room);
    return room;
  }
}

export const NullRoom = new Room();