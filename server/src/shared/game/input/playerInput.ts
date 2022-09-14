import GameButtonStates from "./gameButtonStates";

export default class PlayerInput {
  // 所属玩家
  playerId: number;
  // 序列号
  sn: number;
  // 按钮状态
  buttonStates!: GameButtonStates;

  constructor(playerId: number, sn: number) {
    this.playerId = playerId;
    this.sn = sn;
  }

  encode() {
    const ret = new Uint32Array(1);
    ret[0] = (this.sn << 8) | this.buttonStates.states;
    return ret;
  }

  static decode(val: number) {
    const ret = new PlayerInput(0, val >> 8);
    ret.buttonStates = new GameButtonStates(val & 0xFF);
    return ret;
  }
}
