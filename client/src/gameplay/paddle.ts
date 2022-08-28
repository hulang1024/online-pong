import Game from "./game";
import InputKey from "./input/input-key";
import InputState from "./input/Input-state";
import Vector2 from "./vector";
import Viewport from "./viewport";

export default class Paddle {
  position = Vector2.Zero;
  width = 90;
  height = 15;
  dx = 0;
  private speed = 6 * 62;
  readonly game: Game;
  readonly viewport: Viewport;
  context2d: CanvasRenderingContext2D;

  readonly isLocalPlayer: boolean;

  readonly id: number;
  readonly color: string;

  constructor(id: number, color: string, isLocalPlayer = false, game: Game) {
    this.id = id;
    this.isLocalPlayer = isLocalPlayer;
    this.game = game;
    this.viewport = game.viewport;
    this.color = color;
  }

  fixedUpdate(delta: number, input: InputState) {
    if (input.isPressed(InputKey.Right)) {
      this.dx = this.speed;
    } else if (input.isPressed(InputKey.Left)) {
      this.dx = -this.speed;
    } else {
      this.dx = 0;
    }

    this.position.x += this.dx * delta;

    if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x > this.viewport.width - this.width) {
      this.position.x = this.viewport.width - this.width;
    }
  }

  draw() {
    this.context2d.fillStyle = this.color;
    this.context2d.fillRect(
      this.position.x, this.position.y, this.width, this.height);
  }

}