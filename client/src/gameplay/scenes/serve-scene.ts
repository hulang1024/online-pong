import Game from "../game";
import InputKey from "../input/input-key";
import Player from "../player";
import { randomRange } from "../random";
import Scene from "./scene";

export class ServeScene extends Scene {
  server: Player;
  constructor(game: Game) {
    super('serve', game);
  }

  enter(player: Player): void {
    this.server = player;
  }

  update(_: number) {
    if (!this.server.lastInputState.isPressed(InputKey.Space)) {
      return;
    }
    const { ball } = this.game;
    ball.vel.y = randomRange(ball.minSpeed, ball.maxSpeed);
    ball.vel.x = randomRange(-ball.minSpeed, ball.minSpeed);
    this.game.sceneManager.enter('play');
  }
}