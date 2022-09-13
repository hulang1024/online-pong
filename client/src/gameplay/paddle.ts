import PlayerPaddleState from "../shared/game/states/playerPaddleState";
import TWEEN, { Tween } from 'tween.ts';
import Vector2 from "../shared/game/vector";
import Game from "./game";

export default class Paddle {
  id: number;
  isLocal: boolean;
  private _state: PlayerPaddleState;
  get state(): Readonly<PlayerPaddleState> {
    return this._state;
  }
  context2d: CanvasRenderingContext2D;
  game: Game;
  color: string;
  private tween: any;
  // 渲染插值目标位置
  private readonly targetPos = Vector2.Zero;
  // 渲染当前位置
  private readonly position = Vector2.Zero;

  constructor(game: Game, id: number, color: string, isLocal: boolean) {
    this.game = game;
    this.id = id;
    this.color = color;
    this.isLocal = isLocal;
  }

  updateState(state: PlayerPaddleState) {
    this._state = state;
    const newPos = state.position;
    if (this.isLocal) {
      this.position.set(newPos.x, newPos.y);
    } else {
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
  }

  setState(state: PlayerPaddleState) {
    this._state = state;
    this.position.set(state.position.x, state.position.y);
  }

  draw() {
    //this.context2d.fillStyle = this.color;
    this.context2d.fillRect(
      this.position.x, this.position.y, this.state.width, this.state.height);
  }
}