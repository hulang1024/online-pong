import GameServer from "../game-server";
import Room from "../room/room";
import GameLoop from "./game-loop";

export default class Game {
  room: Room;
  gameLoop = new GameLoop(this);

  constructor(room: Room) {
    this.room = room;
  }

  start(server: GameServer) {
    this.room.players.forEach((player) => {
      player.frames = [];
    });
    server.mainLoop.add(this.gameLoop);
  }

  free(server: GameServer) {
    server.mainLoop.remove(this.gameLoop);
  }
}

export class GameManager {
  games = new Set();

  create(room: Room) {
    const game = new Game(room);
    this.games.add(game);
    return game;
  }
}