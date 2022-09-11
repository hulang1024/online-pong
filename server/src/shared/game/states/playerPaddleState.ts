import ButtonStates from "../input/buttonStates";
import GameButton from "../input/gameButton";
import Vector2 from "../vector";
import Viewport from "../viewport";

export default class PlayerPaddleState {
  playerId!: number;
  position =  Vector2.Zero;
  readonly width = 90;
  readonly height = 15;
  speed = 8 * 62;
  dx = 0;
  viewport: Viewport;

  constructor(viewport: Viewport) {
    this.viewport = viewport;
  }

  clone() {
    const copied = new PlayerPaddleState(this.viewport);
    copied.playerId = this.playerId;
    copied.position = this.position.clone();
    copied.speed = this.speed;
    copied.dx = this.dx;
    return copied;
  }

  update(delta: number, input: ButtonStates<GameButton>) {
    if (input.isPressed(GameButton.Right)) {
      this.dx = this.speed;
    } else if (input.isPressed(GameButton.Left)) {
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
}