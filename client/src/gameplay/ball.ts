import Game from "./game";
import { checkCircleAndRectCollision } from "./physics";
import Vector2 from "./vector";
import Viewport from "./viewport";

export default class Ball {
  // 圆心位置
  position = Vector2.Zero;
  vel = Vector2.Zero;
  maxSpeed = 6 * 62;
  minSpeed = 3 * 62;
  gravity = 0 * 62;
  radius = 8;
  game: Game;
  viewport: Viewport;
  context2d: CanvasRenderingContext2D;

  constructor(game: Game) {
    this.game = game;
    this.viewport = game.viewport;
  }

  fixedUpdate(delta: number) {
    this.vel.y += this.gravity;

    this.position.x += this.vel.x * delta;
    this.position.y += this.vel.y * delta;

    for (let i = 0; i < this.game.paddles.length; i++) {
      if (checkCircleAndRectCollision(this, this.game.paddles[i])) {
        const paddle = this.game.paddles[i];
        this.position.y -= this.vel.y * delta;
        this.position.x -= this.vel.x * delta;
        this.vel.x = -this.vel.x * 1.2;
        this.vel.y = -this.vel.y * 1.2;
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
    } else if (this.position.x > this.game.viewport.width - this.radius) {
      this.position.x = this.game.viewport.width - this.radius;
      this.vel.x = -this.vel.x;
    }
    if (this.position.y - this.radius < 0) {
      this.position.y = this.radius;
      this.vel.y = -this.vel.y;
    } else if (this.position.y > this.viewport.height - this.radius) {
      this.position.y = this.viewport.height - this.radius;
      this.vel.y = -this.vel.y;
    }
  }

  draw() {
    this.context2d.fillStyle = '#eee';
    this.context2d.beginPath();
    this.context2d.arc(this.position.x, this.position.y, this.radius, 0, 360);
    this.context2d.fill();
  }
}