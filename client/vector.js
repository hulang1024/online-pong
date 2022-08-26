export default class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(p) {
    this.x += p.x;
    this.y += p.y;
  }

  plus(p) {
    return new Vector2(this.x + p.x, this.y + p.y);
  }

  subtract(p) {
    this.x -= p.x;
    this.y -= p.y;
  }

  minus(p) {
    return new Vector2(this.x - p.x, this.y - p.y);
  }

  mul(n) {
    return new Vector2(this.x * n, this.y * n);
  }

  distanceTo(to) {
    return Math.sqrt((this.x - to.x) * (this.x - to.x) +
                     (this.y - to.y) * (this.y - to.y));
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  equals(p) {
    return this.x == p.x && this.y == p.y;
  }

  toString() {
    return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ')';
  }
}

Vector2.Zero = () => new Vector2(0, 0);
Vector2.One = () => new Vector2(1, 1);
Vector2.Up = () => new Vector2(0, -1);
Vector2.Right = () => new Vector2(1, 0);
Vector2.Down = () => new Vector2(0, 1);
Vector2.Left = () => new Vector2(-1, 0);

Vector2.ZERO = Vector2.Zero();
Vector2.ONE = Vector2.One();
Vector2.UP = Vector2.Up();
Vector2.RIGHT = Vector2.Right();
Vector2.DOWN = Vector2.Down();
Vector2.LEFT = Vector2.Left()