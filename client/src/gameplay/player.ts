import ButtonStates from "../input/button-states";
import FrameInput from "./frame-input";
import { GameButton } from "./game-input";
import Paddle from "./paddle";

export default class Player {
  id: number;

  frameInputQueue: FrameInput[] = [];
  // 最近一个输入
  lastButtonStates: ButtonStates<GameButton>
    = ButtonStates.EMPTY as ButtonStates<GameButton>;

  paddle: Paddle;

  constructor(id: number) {
    this.id = id;
  }
}