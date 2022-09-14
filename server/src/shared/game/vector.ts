export default class Vector2 {
  x: number;
  y: number;

  static get Zero() { return new Vector2(0, 0); }
  static get One() { return new Vector2(1, 1); }
  static get Up() { return new Vector2(0, -1); }
  static get Right() { return new Vector2(1, 0); }
  static get Down() { return new Vector2(0, 1); }
  static get Left() { return new Vector2(-1, 0); }

  static readonly ZERO = Object.freeze(Vector2.Zero);
  static readonly ONE = Object.freeze(Vector2.One);
  static readonly UP = Object.freeze(Vector2.Up);
  static readonly RIGHT = Object.freeze(Vector2.Right);
  static readonly DOWN = Object.freeze(Vector2.Down);
  static readonly LEFT = Object.freeze(Vector2.Left);

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  add(p: Vector2) {
    this.x += p.x;
    this.y += p.y;
  }

  plus(p: Vector2) {
    return new Vector2(this.x + p.x, this.y + p.y);
  }

  subtract(p: Vector2) {
    this.x -= p.x;
    this.y -= p.y;
  }

  minus(p: Vector2) {
    return new Vector2(this.x - p.x, this.y - p.y);
  }

  mul(n: number) {
    return new Vector2(this.x * n, this.y * n);
  }

  distanceTo(to: Vector2) {
    return Math.sqrt((this.x - to.x) * (this.x - to.x) +
                     (this.y - to.y) * (this.y - to.y));
  }

  sign() {
    return new Vector2(Math.sign(this.x), Math.sign(this.y));
  }

  normalize() {
    let l = this.x * this.x + this.y * this.y;
    if (l != 0) {
      l = Math.sqrt(l);
      this.x /= l;
      this.y /= l;
    }
  }
  
  normalized() {
    const v = this.clone();
    v.normalize();
    return v;
  }


  clone() {
    return new Vector2(this.x, this.y);
  }

  equals(p: Vector2) {
    return this.x == p.x && this.y == p.y;
  }

  toString() {
    return '(' + this.x.toFixed(2) + ', ' + this.y.toFixed(2) + ')';
  }
}