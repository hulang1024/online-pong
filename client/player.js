import Vector2 from "./vector.js";

export default class Player {
  constructor(viewport, isLocalPlayer = false) {
    this.position = Vector2.Zero();
    this.velocity = Vector2.Zero();
    this.maxSpeed = 9 * 62;
    this.minSpeed = 3 * 62;
    // 加速
    this.accele = 1 * 62;
    // 减速
    this.friction = 0.25 * 62;
    this.size = 30;
    this.viewport = viewport;
    this.context2d = null;
    this.isLocalPlayer = isLocalPlayer;
  }

  update(delta, inputs) {
    if (inputs[1]) {
      this.velocity.x = this.velocity.x == 0
        ? this.minSpeed
        : Math.min(this.maxSpeed, this.velocity.x + this.accele);
      this.velocity.y = 0;
    } else if (inputs[3]) {
      this.velocity.x = this.velocity.x == 0
        ? -this.minSpeed
        :  Math.max(-this.maxSpeed, this.velocity.x - this.accele);
      this.velocity.y = 0;
    }
    if (inputs[0]) {
      this.velocity.x = 0;
      this.velocity.y = this.velocity.y == 0
        ? -this.minSpeed
        : Math.max(-this.maxSpeed, this.velocity.y - this.accele);
    } else if (inputs[2]) {
      this.velocity.x = 0;
      this.velocity.y = this.velocity.y == 0
        ? this.minSpeed
        : Math.min(this.maxSpeed, this.velocity.y + this.accele);
    }

    this.position.x += Math.floor(this.velocity.x * delta);
    this.position.y += Math.floor(this.velocity.y * delta);

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
    this.context2d.fillStyle = this.id == 1 ? '#0011ff' : '#ff1100';
    this.context2d.fillRect(
      this.position.x, this.position.y, this.size, this.size);
  }
}