import GameServer from "../game-server";
import Room from "../room/room";
import GameLoop from "./game-loop";

export default class Game {
  room: Room;
  server: GameServer;
  gameLoop: GameLoop;
  state = GameState.Ready;

  constructor(room: Room, server: GameServer) {
    this.room = room;
    this.server = server;
    room.game = this;
    this.gameLoop = new GameLoop(this);
  }

  start() {
    if (this.room.players.some((player) => !player.isReadyRecvFrame)) {
      this.room.broadcastMsg({ type: 'start' });
      return;
    }
    this.room.players.forEach((player) => {
      player.frames = [];
    });
    this.server.mainLoop.add(this.gameLoop);
    this.gameLoop.isPause = false;
    this.state = GameState.Playing;
  }

  pause() {
    if (this.state != GameState.Playing) {
      return;
    }
    this.state = GameState.Paused;
    this.gameLoop.isPause = true;
    this.room.broadcastMsg({ type: 'pause' });
  }

  resume() {
    if (this.state != GameState.Paused) {
      return;
    }
    this.state = GameState.Playing;
    this.gameLoop.isPause = false;
    this.room.broadcastMsg({ type: 'resume' });
  }

  free(server: GameServer) {
    server.mainLoop.remove(this.gameLoop);
    server.roomManager.delete(this.room, server.playerManager);
    server.gameManager.delete(this);
  }
}

export enum GameState {
  Ready,
  Playing,
  Paused,
}

export class GameManager {
  private games = new Set();

  create(room: Room, server: GameServer) {
    const game = new Game(room, server);
    this.games.add(game);
    return game;
  }

  delete(game: Game) {
    this.games.delete(game);
  }
}