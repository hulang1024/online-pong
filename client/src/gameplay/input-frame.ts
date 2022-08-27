import InputKey from "./input/input-key";
import InputState from "./input/Input-state";

export default class InputFrame {
  readonly frameNo: number;
  // 依次表示上 右 下 左 空格的按下与否
  readonly inputFlags: (number | boolean)[];
  
  static readonly flagsLength = 5;

  constructor(frameNo: number, inputs: (number | boolean)[]) {
    this.frameNo = frameNo;
    this.inputFlags = inputs;
  }

  /**
   * 转换到输入状态
   * @returns 输入状态
   */
  toInputState() {
    const keys = [];
    if (this.inputFlags[0])
      keys.push(InputKey.Up);
    if (this.inputFlags[1])
      keys.push(InputKey.Right);
    if (this.inputFlags[2])
      keys.push(InputKey.Down);
    if (this.inputFlags[3])
      keys.push(InputKey.Left);
    if (this.inputFlags[4])
      keys.push(InputKey.Space);
    return new InputState(keys);
  }
  
  /**
   * 编码为二进制传输形式数据
   */
  static encode(frames: InputFrame[]) {
    const ret = new Uint32Array(frames.length);
    let frame, v;
    for (let fi = 0; fi < frames.length; fi++) {
      frame = frames[fi];
      v = frame.frameNo;
      for (let i = 0; i < frame.inputFlags.length; i++) {
        if (frame.inputFlags[i]) {
          v |= 1 << (i + 24);
        }
      }
      ret[fi] = v;
    }
    return ret;
  }

  /**
   * 从输入状态转换
   * @param frameNo 帧号
   * @param inputState 输入状态
   */
  static fromInputState(frameNo: number, inputState: InputState) {
    return new InputFrame(frameNo,
      [
        inputState.isPressed(InputKey.Up),
        inputState.isPressed(InputKey.Right),
        inputState.isPressed(InputKey.Down),
        inputState.isPressed(InputKey.Left),
        inputState.isPressed(InputKey.Space),
      ]
    );
  }
}
