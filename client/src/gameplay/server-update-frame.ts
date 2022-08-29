import FrameInput from "./frame-input";
import ButtonStates from "../input/button-states";
import { GameButton } from "./game-input";
import Player from "./player";

export default class ServerUpdateFrame {
  readonly frameNo: number;
  playerFrameInputQueue = new Map<number, ButtonStates<GameButton>[]>();

  constructor(frameNo: number) {
    this.frameNo = frameNo;
  }

  static decode(data: Blob, players: Player[],
    complete: (_: ServerUpdateFrame) => void) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target.readyState != FileReader.DONE) {
        return;
      }
  
      // 更新帧的字节布局：
      // <当前帧号(3B)>
      // <玩家1输入帧数量><玩家1输入帧对象组>...
      // <玩家n输入帧数量(1B)><玩家n输入对象帧组(输入帧数量 * 4B)>
      // 注：输入帧对象：<输入信息(1B)>
  
      const dv = new DataView(ev.target.result as ArrayBuffer);
      // 读更新帧的当前帧号（3字节）
      const serverUpdateFrame = new ServerUpdateFrame(
        dv.getUint32(0, true) & 0xFFFFFF);

      let offset = 3;
      // 对所有玩家
      players.forEach((player) => {
        // 读输入帧的数量
        const frameCount =  dv.getUint8(offset++);
        const inputs: ButtonStates<GameButton>[] = [];
        for (let f = 0; f < frameCount; f++) {
          // 读输入帧
          inputs.push(FrameInput.decode(dv.getUint8(offset++)));
        }
        serverUpdateFrame.playerFrameInputQueue.set(player.id, inputs);
      });
      complete(serverUpdateFrame);
    };
    reader.readAsArrayBuffer(data);
  }
}