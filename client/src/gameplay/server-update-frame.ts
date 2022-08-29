import InputFrame from "./input-frame";
import Player from "./player";

export default class ServerUpdateFrame {
  readonly frameNo: number;
  readonly nextKeyFrameNo: number;
  playerInputFrames = new Map<number, InputFrame[]>();

  private static reader = new FileReader();

  constructor(frameNo: number, nextKeyFrameNo: number) {
    this.frameNo = frameNo;
    this.nextKeyFrameNo = nextKeyFrameNo;
  }

  static decode(data: Blob, players: Player[],
    complete: (_: ServerUpdateFrame) => void) {
    ServerUpdateFrame.reader.onload = (ev) => {
      if (ev.target.readyState != FileReader.DONE) {
        return;
      }
  
      // 更新帧的字节布局：
      // <当前帧号(3B)><下个关键帧号(3B)>
      // <玩家1输入帧数量><玩家1输入帧对象组>...
      // <玩家n输入帧数量(1B)><玩家n输入对象帧组(输入帧数量 * 4B)>
      // 注：输入帧对象：<输入帧帧号(3B)><输入信息(1B)>
  
      const dv = new DataView(ev.target.result as ArrayBuffer);
      // 读更新帧的当前帧号和下个关键帧号（6字节）
      const serverUpdateFrame = new ServerUpdateFrame(
        dv.getUint32(0, true) & 0xFFFFFF,
        dv.getUint32(3, true) & 0xFFFFFF);

      let offset = 6;
      // 对所有玩家
      players.forEach((player) => {
        // 读输入帧的数量
        const frameCount =  dv.getUint8(offset++);
        const inputFrames = [];
        for (let f = 0; f < frameCount; f++) {
          // 读输入帧
          const val = dv.getUint32(offset, true);
          offset += 4;
          // 读帧号（低位3字节）
          const frameNo = val & 0xFFFFFF;
          // 读输入（高位1字节）
          const inputFlags: number[] = [];
          for (let b = 0; b < InputFrame.flagsLength; b++) {
            inputFlags.push(val & (1 << (b + 24)));
          }
          inputFrames.push(new InputFrame(frameNo, inputFlags));
        }
        serverUpdateFrame.playerInputFrames.set(player.id, inputFrames);
        console.log(serverUpdateFrame.playerInputFrames.size);
      });
      complete(serverUpdateFrame);
    };
    ServerUpdateFrame.reader.readAsArrayBuffer(data);
  }
}