import GameStateSystem from "../../shared/game/gameStateSystem";
import GameButton from "../../shared/game/input/gameButton";
import GameButtonStates from "../../shared/game/input/gameButtonStates";
import PlayerInput from "../../shared/game/input/playerInput";
import { random } from "../../shared/game/random";
import BallState from "../../shared/game/states/ballState";
import PlayerPaddleState, { Y_OFFSET } from "../../shared/game/states/playerPaddleState";
import Vector2 from "../../shared/game/vector";
import GameLoop from "../gameLoop";
import Player from "../player";

export default class PongAI {
  gameLoop!: GameLoop;
  player!: Player;
  gameStateSystem: GameStateSystem;
  ballState: BallState;
  paddleState: PlayerPaddleState;
  targetPosX = -1;
  targetDir = 0 as 0 | -1 | 1;
  state = 'idle' as 'catch_move' | 'catch_stop' | 'idle';
  buttonStates = new GameButtonStates(0);

  constructor(player: Player, gameLoop: GameLoop) {
    this.player = player;
    this.gameLoop = gameLoop;
    this.gameStateSystem = gameLoop.gameStateSystem;
    this.ballState = this.gameStateSystem.states.ballState;
    this.paddleState = this.gameStateSystem.states.paddleStates
      .find((p) => p.playerId == player.id)!;
  }

  update(delta: number) {
    if (this.gameStateSystem.gameState != 'play') {
      return;
    }

    if (this.state == 'catch_move') {
      const distance = this.targetPosX
        - (this.paddleState.position.x + this.paddleState.width / 2);
      if (this.targetDir == 0) {
        this.targetDir = distance > 0 ? 1 : -1;
      }
      if (this.targetDir > 0 ? distance <= 0 : distance >= 0) {
        this.state = 'catch_stop';
        this.targetPosX = -1;
        this.targetDir = 0;
      } else {
        this.buttonStates.reset();
        this.buttonStates.setPressed(
          distance > 0 ? GameButton.Right : GameButton.Left, true);
        const input = new PlayerInput(this.player.id, 0);
        input.buttonStates = this.buttonStates.clone();
        this.gameLoop.inputBuffer.push(input);  
      }
    } else if (this.state == 'catch_stop') {
      if (this.ballState.vel.y > 0) {
        this.state = 'idle';
      }
    } else if (this.state == 'idle') {
      if (this.ballState.vel.y < 0) {
        this.targetPosX = this.guessBallFinalX().x;
        this.targetDir = 0;
        this.state = 'catch_move';
      }
    } 
  }

  // 预测球的最终位置
  private guessBallFinalX() {
    const { ballState } = this;
    const finalPos = ballState.position.clone();
    const vel = ballState.vel.clone();
    const viewport = this.gameStateSystem.viewport;
    let n = viewport.height * viewport.width;
    while (n-- > 0) {
      finalPos.add(vel);
      if (finalPos.y <= this.paddleState.height + Y_OFFSET) {
        finalPos.subtract(vel);
        return finalPos;
      }

      if (finalPos.x - ballState.radius < 0 ||
          finalPos.x + ballState.radius > viewport.width) {
        finalPos.x = ballState.radius;
        vel.x = -vel.x;
      }
      if (finalPos.y - ballState.radius < 0 ||
          finalPos.y + ballState.radius > viewport.height) {
        finalPos.y = viewport.height - ballState.radius;
        vel.y = -vel.y;
      }
    }
    return finalPos;
  }
}