import InputFrame from "./input-frame";
import InputState from "./input/Input-state";

export default class Player {
  id: number;

  // 玩家的InputFrame的缓冲区
  inputFrameQueue: InputFrame[] = [];
  // 最近一个输入
  lastInputState: InputState = InputState.EMPTY;
}