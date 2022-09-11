import BallState from "./ballState";
import PlayerPaddleState from "./playerPaddleState";

export default class GameStates {
  ballState!: BallState;
  paddleStates: PlayerPaddleState[] = [];

  clone() {
    const copied = new GameStates();
    copied.ballState = this.ballState.clone();
    copied.paddleStates = this.paddleStates.map((s) => s.clone());
    return copied;
  }
}