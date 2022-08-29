import Game from "../game";
import { GameButton } from "../game-input";
import Player from "../player";
import { randomRange } from "../random";
import Scene from "./scene";

export class ServeScene extends Scene {
  // 发球者
  server: Player;
  constructor(game: Game) {
    super('serve', game);
  }

  enter(player: Player): void {
    this.server = player;
  }

  update(_: number) {
    if (!this.server.lastButtonStates.isPressed(GameButton.Serve)) {
      return;
    }
    const { ball } = this.game;
    ball.vel.y = randomRange(ball.minSpeed, ball.maxSpeed);
    ball.vel.x = randomRange(-ball.minSpeed, ball.minSpeed);
    this.game.sceneManager.enter('play');
  }
}