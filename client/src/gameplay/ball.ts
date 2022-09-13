import BallState from "../shared/game/states/ballState";
import TWEEN, { Tween } from 'tween.ts';
import Vector2 from "../shared/game/vector";
import Game from "./game";

export default class Ball {
  private _state: BallState;
  get state(): Readonly<BallState> {
    return this._state;
  }

  context2d: CanvasRenderingContext2D;
  game: Game;
  private tween: any;
  // 渲染插值目标位置
  private readonly targetPos = Vector2.Zero;
  // 渲染当前位置
  private readonly position = Vector2.Zero;

  constructor(game: Game) {
    this.game = game;
  }

  updateState(state: BallState) {
    this._state = state;
    const newPos = state.position;

    if (!this.targetPos.equals(newPos)) {
      this.tween?.stop();
      this.targetPos.set(newPos.x, newPos.y);

      // 插值到新的位置
      this.tween = new Tween(this.position)
        .to(newPos, 1000 / this.game.updateFPS)
        .easing(TWEEN.Easing.Linear.None)
        .start();
    }
  }

  setState(state: BallState) {
    this._state = state;
    const newPos = state.position;
    this.targetPos.set(newPos.x, newPos.y);
    this.position.set(newPos.x, newPos.y);
  }

  draw() {
    //this.context2d.fillStyle = '#eee';
    const { radius } = this._state;
    this.context2d.fillRect(
      this.position.x - radius, this.position.y - radius,
      radius * 2, radius * 2);
  }
}