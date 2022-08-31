import { GameButton } from "./game-input";
import ButtonStates from "../input/button-states";

export default class FrameInput {
  /**
   * 转换到输入状态
   * @returns 输入状态
   */
  static decode(val: number) {
    const pressedButtons = [];
    if (val & 1) pressedButtons.push(GameButton.Up);
    if (val & 2) pressedButtons.push(GameButton.Right);
    if (val & 4) pressedButtons.push(GameButton.Down);
    if (val & 8) pressedButtons.push(GameButton.Left);
    if (val & 16) pressedButtons.push(GameButton.Serve);
    return new ButtonStates<GameButton>(pressedButtons);
  }
  
  /**
   * 编码为二进制传输形式数据
   */
  static encode(buttonStates: ButtonStates<GameButton>) {
    let v = 0;
    if (buttonStates.isPressed(GameButton.Up))    v |= 1;
    if (buttonStates.isPressed(GameButton.Right)) v |= 2;
    if (buttonStates.isPressed(GameButton.Down))  v |= 4;
    if (buttonStates.isPressed(GameButton.Left))  v |= 8;
    if (buttonStates.isPressed(GameButton.Serve)) v |= 16;

    const ret = new Uint8Array(1);
    ret[0] = v;
    return ret;
  }
}
