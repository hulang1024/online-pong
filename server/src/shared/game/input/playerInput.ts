import GameButton from "./gameButton";
import ButtonStates from "./buttonStates";

export default class PlayerInput {
  playerId!: number;
  sn: number;
  buttonStates: ButtonStates<GameButton>;

  constructor(playerId: number, sn: number, buttonStates: ButtonStates<GameButton>) {
    this.playerId = playerId;
    this.sn = sn;
    this.buttonStates = buttonStates;
  }

  /**
   * 编码为二进制传输形式数据
   */
  encode() {
    const ret = new Uint32Array(1);
    let v = this.sn << 8;
    ret[0] = PlayerInput.encodeButtonStates(v, this.buttonStates);
    return ret;
  }

  encodeButtonStates() {
    return PlayerInput.encodeButtonStates(0, this.buttonStates);
  }

  static encodeButtonStates(v: number, buttonStates: ButtonStates<GameButton>) {
    if (buttonStates.isPressed(GameButton.Up))    v |= 1;
    if (buttonStates.isPressed(GameButton.Right)) v |= 2;
    if (buttonStates.isPressed(GameButton.Down))  v |= 4;
    if (buttonStates.isPressed(GameButton.Left))  v |= 8;
    if (buttonStates.isPressed(GameButton.Serve)) v |= 16;
    return v;
  }

  static decode(playerId: number, val: number) {
    const sn = val >> 8;
    val &= 0xFF;
    const buttonStates = PlayerInput.decodeButtonStates(val);
    return new PlayerInput(playerId, sn, buttonStates);
  }
  
  static decodeButtonStates(val: number) {
    const pressedButtons = [];
    if (val & 1) pressedButtons.push(GameButton.Up);
    if (val & 2) pressedButtons.push(GameButton.Right);
    if (val & 4) pressedButtons.push(GameButton.Down);
    if (val & 8) pressedButtons.push(GameButton.Left);
    if (val & 16) pressedButtons.push(GameButton.Serve);
    return new ButtonStates<GameButton>(pressedButtons);
  }
}
