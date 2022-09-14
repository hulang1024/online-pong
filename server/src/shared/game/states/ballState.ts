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
  readonly radius = 6;
  viewport: Viewport;
  stateSystem: GameStateSystem;

  constructor(stateSystem: GameStateSystem) {
    this.stateSystem = stateSystem;
    this.viewport = stateSystem.viewport;
  }

  reset() {
    this.position.set(this.viewport.width / 2, this.viewport.height / 2);
  }

  serve(yDir: 1 | -1) {
    this.vel.y = yDir * randomRange(this.minSpeed, this.maxSpeed);
    this.vel.x = randomRange(-this.minSpeed, this.minSpeed);
  }

  clone() {
    const copied = new BallState(this.stateSystem);
    copied.position = this.position.clone();
    copied.vel = this.vel.clone();
    return copied;
  }

  update(delta: number) {
    this.position.x += this.vel.x * delta;
    this.position.y += this.vel.y * delta;

    const { paddleStates } = this.stateSystem.states;
    for (let i = 0; i < paddleStates.length; i++) {
      const paddleState = paddleStates[i];
      if (checkCircleAndRectCollision(this, paddleState)) {
        this.position.y -= this.vel.y * delta + Math.sign(this.vel.y) * this.radius;
        this.position.x -= this.vel.x * delta;
        this.vel.x = -Math.sign(this.vel.x) * randomRange(this.minSpeed, this.maxSpeed);
        this.vel.y = -this.vel.y * randomRange(1, 1.3);
        this.stateSystem.handlePaddleHit(paddleState);
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
      this.vel.x = -this.vel.x;
      this.stateSystem.handleBorderHit(Vector2.LEFT);
    } else if (this.position.x > this.viewport.width - this.radius) {
      this.position.x = this.viewport.width - this.radius;
      this.vel.x = -this.vel.x;
      this.stateSystem.handleBorderHit(Vector2.RIGHT);
    }
    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.vel.y = -this.vel.y;
      this.stateSystem.handleBorderHit(Vector2.UP);
    } else if (this.position.y > this.viewport.height - this.radius) {
      this.position.y = this.viewport.height - this.radius;
      this.vel.y = -this.vel.y;
      this.stateSystem.handleBorderHit(Vector2.DOWN);
    }
  }
}