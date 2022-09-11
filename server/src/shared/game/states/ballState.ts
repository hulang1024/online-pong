import GameStates from ".";
import GameStateSystem from "../gameStateSystem";
import { checkCircleAndRectCollision } from "../physics";
import { randomRange } from "../random";
import Vector2 from "../vector";
import Viewport from "../viewport";

export default class BallState {
  // 圆心位置
  position = Vector2.Zero;
  // 速度
  vel = Vector2.Zero;
  readonly maxSpeed = 6 * 62;
  readonly minSpeed = 3 * 62;
  readonly gravity = 0 * 62;
  readonly radius = 8;
  viewport: Viewport;
  stateSystem: GameStateSystem;

  constructor(stateSystem: GameStateSystem, viewport: Viewport) {
    this.stateSystem = stateSystem;
    this.viewport = viewport;
  }

  clone() {
    const copied = new BallState(this.stateSystem, this.viewport);
    copied.position = this.position.clone();
    copied.vel = this.vel.clone();
    return copied;
  }

  update(delta: number) {
    this.vel.y += this.gravity;

    this.position.x += this.vel.x * delta;
    this.position.y += this.vel.y * delta;

    const { paddleStates } = this.stateSystem.states;
    for (let i = 0; i < paddleStates.length; i++) {
      const paddleState = paddleStates[i];
      if (checkCircleAndRectCollision(this, paddleState)) {
        this.position.y -= this.vel.y * delta;
        this.position.x -= this.vel.x * delta;
        this.vel.x = -this.vel.x * randomRange(1, 2);
        this.vel.y = -this.vel.y * randomRange(1, 2);
        break;
      }
    }

    if (Math.abs(this.vel.x) > this.maxSpeed) {
      this.vel.x = Math.sign(this.vel.x) * this.maxSpeed;
    }
    if (Math.abs(this.vel.y) > this.maxSpeed) {
      this.vel.y = Math.sign(this.vel.y) * this.maxSpeed;
    }

    if (this.position.x - this.radius < 0) {
      this.position.x = this.radius;
      this.vel.x = -this.vel.x * randomRange(1, 2);
    } else if (this.position.x > this.viewport.width - this.radius) {
      this.position.x = this.viewport.width - this.radius;
      this.vel.x = -this.vel.x * randomRange(1, 2);
    }
    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.vel.y = -this.vel.y * randomRange(1, 2);
    } else if (this.position.y > this.viewport.height - this.radius) {
      this.position.y = this.viewport.height - this.radius;
      this.vel.y = -this.vel.y * randomRange(1, 2);
    }
  }
}