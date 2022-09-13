import GameButton from "./gameButton";
import ButtonStates from "./buttonStates";

export default class PlayerInput {
  // 所属玩家
  playerId!: number;
  // 序列号
  sn: number;
  // 按钮状态
  buttonStates: ButtonStates<GameButton>;

  constructor(playerId: number, sn: number, bs: ButtonStates<GameButton>) {
    this.playerId = playerId;
    this.sn = sn;
    this.buttonStates = bs;
  }

  /**
   * 编码为二进制传输形式数据
   */
  encode() {
    const ret = new Uint32Array(1);
    ret[0] = (this.sn << 8) | PlayerInput.encodeButtonStates(this.buttonStates);
    return ret;
  }

  static encodeButtonStates(bs: ButtonStates<GameButton>) {
    let val = 0;
    for (const b in GameButton) {
      if (isNaN(+b)) break;
      val |= +bs.isPressed(+b);
    }
    return val;
  }

  static decode(val: number) {
    return new PlayerInput(0,
      val >> 8, PlayerInput.decodeButtonStates(val & 0xFF));
  }
  
  static decodeButtonStates(val: number) {
    const pressedButtons: GameButton[] = [];
    for (const b in GameButton) {
      if (isNaN(+b)) break;
      if (val & +b) pressedButtons.push(+b);
    }
    return new ButtonStates<GameButton>(pressedButtons);
  }
}
