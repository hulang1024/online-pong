import { initRandomSeed, randomRange } from "./random";
import { GameStateSystemInput } from "./input";
import GameButton from "./input/gameButton";
import PlayerInput from "./input/playerInput";
import GameStates from "./states";
import BallState from "./states/ballState";
import PlayerPaddleState from "./states/playerPaddleState";
import Viewport from "./viewport";

const FPS = 60;
const S_PER_UPDATE = 1 / FPS;

export default class GameStateSystem {
  // 运行在服务器模式还是客户端（行为应该一样，但还是有一些不同）
  private serverMode: boolean;

  private _states!: GameStates;
  // 当状态变化时，该引用会变化，获取最新状态请使用 gameStateSystem.states
  get states(): Readonly<GameStates> { return this._states; }

  private updateLag = 0;

  // 是否已发球（TODO：用游戏状态机替换）
  private isServed = false;

  private lastSaveStates: GameStates | null = null;

  viewport!: Viewport;

  constructor(serverMode: boolean) {
    this.serverMode = serverMode;
    this.viewport = new Viewport(500, 500);
    // 初始化状态
    this._states = new GameStates();
    const ballState = new BallState(this, this.viewport);
    ballState.viewport = this.viewport;
    ballState.position.set(this.viewport.width / 2, this.viewport.height / 2);
    this._states.ballState = ballState;

    initRandomSeed(10);
  }

  initPlayers(playerIds: number[]) {
    // 创建Paddle
    playerIds.forEach((playerId, i) => {
      const paddleState = new PlayerPaddleState(this.viewport);
      paddleState.playerId = playerId;
      paddleState.viewport = this.viewport;
      if (i % 2 == 0) {
        paddleState.position.set((this.viewport.width - paddleState.width) / 2, 0);
      } else {
        paddleState.position.set(
          (this.viewport.width - paddleState.width) / 2,
          this.viewport.height - paddleState.height);
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
    while (this.updateLag >= S_PER_UPDATE) {
      this._states.ballState.update(S_PER_UPDATE);
      this.updateLag -= S_PER_UPDATE;
    }
  }

  applyInputs(inputs: GameStateSystemInput[], delta: number) {
    inputs.forEach((input) => this.applyInput(input, delta));
  }

  applyInput(input: GameStateSystemInput, delta: number) {
    if (input instanceof PlayerInput) {
      if (input.buttonStates.isPressed(GameButton.Serve)) {
        if (!this.isServed) {
          const { ballState } = this._states;
          ballState.vel.y = randomRange(ballState.minSpeed, ballState.maxSpeed);
          ballState.vel.x = randomRange(-ballState.minSpeed, ballState.minSpeed);
          this.isServed = true;
        }
      } else {
        const paddleState = this._states.paddleStates.find(
          (p) => p.playerId == input.playerId);
        paddleState?.update(delta, input.buttonStates);
      }
    }
  }
}