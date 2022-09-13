import BallState from "./ballState";
import PlayerPaddleState from "./playerPaddleState";

export default class GameStates {
  ballState!: BallState;
  paddleStates: PlayerPaddleState[] = [];
  score1 = 0;
  score2 = 0;

  clone() {
    const copied = new GameStates();
    copied.ballState = this.ballState.clone();
    copied.paddleStates = this.paddleStates.map((s) => s.clone());
    copied.score1 = this.score1;
    copied.score2 = this.score2;
    return copied;
  }
}