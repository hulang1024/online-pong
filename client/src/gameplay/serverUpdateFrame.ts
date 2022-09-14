import { GameStateSystemInput } from "../shared/game/input";
import GameButtonStates from "../shared/game/input/gameButtonStates";
import PlayerInput from "../shared/game/input/playerInput";
import Player from "./player";

export default class ServerUpdateFrame {
  frameNo: number;
  lastSn: number;
  inputs: GameStateSystemInput[] = [];

  constructor(frameNo: number, lastSn: number) {
    this.frameNo = frameNo;
    this.lastSn = lastSn;
  }

  static decode(
    data: Blob, players: Player[], complete: (_: ServerUpdateFrame) => void) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target.readyState != FileReader.DONE) {
        return;
      }
  
      const dv = new DataView(ev.target.result as ArrayBuffer);
      const frameNo = dv.getUint32(0, true) & 0xFFFFFF;
      // 读更新帧的最后帧号
      const updateFrame = new ServerUpdateFrame(frameNo, dv.getUint32(0, true));
      updateFrame.lastSn = dv.getUint32(3, true);

      let offset = 7;
      const { inputs } = updateFrame;
      while (offset < dv.byteLength) {
        const type = dv.getUint8(offset++);
        let input;
        if (type == 2) {
          const playerIndex = dv.getUint8(offset++);
          input = new PlayerInput(players[playerIndex].id, -1);
          input.buttonStates = new GameButtonStates(dv.getUint8(offset++));
        }
        if (input) inputs.push(input);
      }
      console.log(JSON.stringify(updateFrame));
      complete(updateFrame);
    };
    reader.readAsArrayBuffer(data);
  }
}