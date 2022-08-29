import ButtonStates from "../input/button-states";
import { GameButton } from "./game-input";
import Paddle from "./paddle";

export default class Player {
  id: number;

  frameInputQueue: ButtonStates<GameButton>[] = [];
  // 最近一个输入
  lastButtonStates: ButtonStates<GameButton>
    = ButtonStates.EMPTY as ButtonStates<GameButton>;

  paddle: Paddle;

  constructor(id: number) {
    this.id = id;
  }
}