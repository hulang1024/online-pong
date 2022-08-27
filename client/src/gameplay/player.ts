import InputKey from "./input/input-key";
import InputState from "./input/Input-state";
import Vector2 from "./vector";
import Viewport from "./viewport";

export default class Player {
  readonly position = Vector2.Zero;
  private size = 30;
  private velocity = Vector2.Zero;
  private maxSpeed = 9 * 62;
  private minSpeed = 3 * 62;
  private accele = 1 * 62;
  private friction = 0.25 * 62;
  readonly viewport: Viewport;
  context2d: CanvasRenderingContext2D;

  readonly isLocalPlayer: boolean;

  readonly id: number;
  readonly color: string;

  constructor(id: number, color: string,
    isLocalPlayer = false, viewport: Viewport) {
    this.id = id;
    this.isLocalPlayer = isLocalPlayer;
    this.viewport = viewport;
    this.color = color;
  }

  fixedUpdate(delta: number, input: InputState) {
    if (input.isPressed(InputKey.Right)) {
      this.velocity.x = this.velocity.x == 0
        ? this.minSpeed
        : Math.min(this.maxSpeed, this.velocity.x + this.accele);
      this.velocity.y = 0;
    } else if (input.isPressed(InputKey.Left)) {
      this.velocity.x = this.velocity.x == 0
        ? -this.minSpeed
        :  Math.max(-this.maxSpeed, this.velocity.x - this.accele);
      this.velocity.y = 0;
    }
    if (input.isPressed(InputKey.Up)) {
      this.velocity.x = 0;
      this.velocity.y = this.velocity.y == 0
        ? -this.minSpeed
        : Math.max(-this.maxSpeed, this.velocity.y - this.accele);
    } else if (input.isPressed(InputKey.Down)) {
      this.velocity.x = 0;
      this.velocity.y = this.velocity.y == 0
        ? this.minSpeed
        : Math.min(this.maxSpeed, this.velocity.y + this.accele);
    }

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    if (this.velocity.x > 0) {
      this.velocity.x = Math.max(this.velocity.x - this.friction, 0);
    } else if (this.velocity.x < 0) {
      this.velocity.x = Math.min(this.velocity.x + this.friction, 0);
    }
    if (this.velocity.y > 0) {
      this.velocity.y = Math.max(this.velocity.y - this.friction, 0);
    } else if (this.velocity.y < 0) {
      this.velocity.y = Math.min(this.velocity.y + this.friction, 0);
    }

    if (this.position.x < 0) {
      this.position.x = 0;
      this.velocity.x = 0;
    } else if (this.position.x > this.viewport.width - this.size) {
      this.position.x = this.viewport.width - this.size;
      this.velocity.x = 0;
    }
    if (this.position.y < 0) {
      this.position.y = 0;
      this.velocity.y = 0;
    } else if (this.position.y > this.viewport.height - this.size) {
      this.position.y = this.viewport.height - this.size;
      this.velocity.y = 0;
    }
  }

  draw() {
    this.context2d.fillStyle = this.color;
    this.context2d.fillRect(
      this.position.x, this.position.y, this.size, this.size);
  }
}