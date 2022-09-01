import FrameInput from "./frame-input";
import Player from "./player";

export default class ServerUpdateFrame {
  readonly frameNo: number;
  playerFrameInputQueue = new Map<number, FrameInput[]>();

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
  
      const dv = new DataView(ev.target.result as ArrayBuffer);
      // 读更新帧的当前帧号（3字节）
      const serverUpdateFrame = new ServerUpdateFrame(
        dv.getUint32(0, true) & 0xFFFFFF);

      let offset = 3;
      // 对所有玩家
      players.forEach((player) => {
        // 读输入帧的数量
        const frameCount =  dv.getUint8(offset++);
        const inputs: FrameInput[] = [];
        for (let f = 0; f < frameCount; f++) {
          // 读输入帧
          inputs.push(FrameInput.decode(dv.getUint32(offset, true)));
          offset += 4;
        }
        serverUpdateFrame.playerFrameInputQueue.set(player.id, inputs);
      });
      complete(serverUpdateFrame);
    };
    reader.readAsArrayBuffer(data);
  }
}