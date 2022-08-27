import GameServer from "../game-server";
import Room from "../room/room";
import GameLoop from "./game-loop";

export default class Game {
  room: Room;
  gameLoop: GameLoop;
  state = GameState.Ready;

  constructor(room: Room) {
    this.room = room;
    room.game = this;
    this.gameLoop = new GameLoop(this);
  }

  start(server: GameServer) {
    this.room.players.forEach((player) => {
      player.frames = [];
    });
    server.mainLoop.add(this.gameLoop);
    this.state = GameState.Playing;
    this.broadcast({ type: 'start' });
  }

  pause() {
    if (this.state != GameState.Playing) {
      return;
    }
    this.state = GameState.Paused;
    this.gameLoop.isPause = true;
    this.broadcast({ type: 'pause' });
  }

  resume() {
    if (this.state != GameState.Paused) {
      return;
    }
    this.state = GameState.Playing;
    this.gameLoop.isPause = false;
    this.broadcast({ type: 'resume' });
  }

  free(server: GameServer) {
    server.mainLoop.remove(this.gameLoop);
  }

  private broadcast(msg: any) {
    this.room.players.forEach((player) => {
      player.send(JSON.stringify(msg));
    });
  }
}

export enum GameState {
  Ready,
  Playing,
  Paused,
}

export class GameManager {
  games = new Set();

  create(room: Room) {
    const game = new Game(room);
    this.games.add(game);
    return game;
  }
}