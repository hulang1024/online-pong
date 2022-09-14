import { initRandomSeed, randomRange } from "./random";
import { GameStateSystemInput } from "./input";
import GameButton from "./input/gameButton";
import PlayerInput from "./input/playerInput";
import GameStates from "./states";
import BallState from "./states/ballState";
import PlayerPaddleState from "./states/playerPaddleState";
import Viewport from "./viewport";
import Vector2 from "./vector";

const FPS = 60;
export const S_PER_UPDATE = 1 / FPS;

export default class GameStateSystem {
  // 运行在服务器模式还是客户端（行为应该一样，但还是有一些不同）
  private serverMode: boolean;

  private _states!: GameStates;
  // 当状态变化时，该引用会变化，获取最新状态请使用 gameStateSystem.states
  get states(): Readonly<GameStates> { return this._states; }
  private lastSaveStates: GameStates | null = null;
  viewport!: Viewport;
  servingPlayerNo = 1 as 1 | 2;
  gameState = 'start' as 'start' | 'pause' | 'serve' | 'play'
  private updateLag = 0;

  onUpdate = (delta: number) => {};
  onPaddleHit = (paddleState: PlayerPaddleState) => {};
  onWallHit = (border: Vector2) => {};
  onScore = () => {};

  constructor(serverMode: boolean) {
    this.serverMode = serverMode;
    this.viewport = new Viewport(500, 500);
    // 初始化状态
    this._states = new GameStates();
    const ballState = new BallState(this);
    ballState.reset();
    this._states.ballState = ballState;

    initRandomSeed(10);
  }

  initPlayers(playerIds: number[]) {
    const { viewport } = this;
    // 创建Paddle
    const Y_OFFSET = 10;
    playerIds.forEach((playerId, i) => {
      const paddleState = new PlayerPaddleState(viewport);
      paddleState.playerId = playerId;
      paddleState.viewport = viewport;
      if (i % 2 == 0) {
        paddleState.position.set(30, Y_OFFSET);
      } else {
        paddleState.position.set(
          viewport.width - paddleState.width - 30,
          viewport.height - paddleState.height - Y_OFFSET);
      }
      this._states.paddleStates.push(paddleState);
    });

    this.save();
  }

  // 保存当前状态
  save() {
    this.lastSaveStates = this._states.clone();
  }

  // 恢复到上次保存状态
  restore() {
    // 必须成对使用，否则测试阶段会报空指针错误
    this._states = this.lastSaveStates!;
    this.lastSaveStates = null;
  }

  update(delta: number) {
    this.updateLag += delta;
    // 以固定帧率运行
    while (this.updateLag >= S_PER_UPDATE) {
      if (this.gameState == 'play') {
        this._states.ballState.update(S_PER_UPDATE);
        this.onUpdate(S_PER_UPDATE);
      }
      this.updateLag -= S_PER_UPDATE;
    }
  }

  applyInputs(inputs: GameStateSystemInput[]) {
    inputs.forEach((input) => this.applyInput(input));
  }

  applyInput(input: GameStateSystemInput) {
    if (input instanceof PlayerInput) {
      if (this.gameState == 'play') {
        if (input.buttonStates.isPressed(GameButton.Ok)) {
          this.gameState = 'pause';
        } else {
          const paddleState = this._states.paddleStates.find(
            (p) => p.playerId == input.playerId);
          paddleState?.update(S_PER_UPDATE, input.buttonStates);  
        }
      } else if (this.gameState == 'serve') {
        if (input.buttonStates.isPressed(GameButton.Ok)) {
          this._states.ballState.serve(this.servingPlayerNo == 1 ? 1 : -1);
          this.gameState = 'play';
        } else {
          const paddleState = this._states.paddleStates.find(
            (p) => p.playerId == input.playerId);
          paddleState?.update(S_PER_UPDATE, input.buttonStates);  
        }
      } else if (this.gameState == 'pause') {
        if (input.buttonStates.isPressed(GameButton.Ok)) {
          this.gameState = 'play';
        }
      } else if (this.gameState == 'start') {
        if (input.buttonStates.isPressed(GameButton.Ok)) {
          this.gameState = 'serve';
        }
      } 
    }
  }

  handlePaddleHit(paddleState: PlayerPaddleState) {
    this.onPaddleHit(paddleState);
  }

  handleBorderHit(border: Vector2) {
    if (border.y != 0) {
      if (border.y > 0) {
        this._states.score1++;
        this.servingPlayerNo = 2;
      } else if (border.y < 0) {
        this._states.score2++;
        this.servingPlayerNo = 1;
      }
      this.gameState = 'serve';
      this._states.ballState.reset();
      this.onScore();
    } else {
      this.onWallHit(border);
    }
  }
}