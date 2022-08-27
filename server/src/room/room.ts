import Game from "../gameplay/game";
import Player from "../gameplay/player";
import User from "../user/user";

let RoomId = 0;

export default class Room {
  id: number;
  creator: User = User.Null;
  createAt: number = 0;
  game: Game | null = null;
  players: Player[] = [];

  static readonly Null = new Room();

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

  isFull() {
    return false;
  }

  countPlayer() {
    return this.players.length;
  }
}