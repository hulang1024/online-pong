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
  
      // 读更新帧的当前帧号和下个关键帧号（6字节）
      const dv = new DataView(ev.target.result as ArrayBuffer);
      const serverUpdateFrame = new ServerUpdateFrame(
        dv.getUint32(0, true) & 0xFFFFFF,
        dv.getUint32(3, true) & 0xFFFFFF);

      // 对所有玩家
      let offset = 6;
      for (let p = 0; p < players.length; p++) {
        if (!players[p].isLocalPlayer) {
          // 读输入帧的数量（本地玩家的未传输，跳过）
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
          serverUpdateFrame.playerInputFrames.set(players[p].id, inputFrames);
          console.log(serverUpdateFrame.playerInputFrames.size);
        }
      }
      complete(serverUpdateFrame);
    };
    ServerUpdateFrame.reader.readAsArrayBuffer(data);
  }
}