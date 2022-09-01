import Player from "./player";
import Game from "./game";
import MainLoop, { FixedUpdatable } from "./main-loop";
import Room from "../room/room";

export default class GameLoop implements FixedUpdatable {
  mainLoop: MainLoop
  // 更新帧间隔
  msPerFrame = 3 / 60 * 1000;
  // 当前更新帧号
  private frameNo = 0;
  // 关联房间
  private room: Room | null = null;
  // 游戏内玩家
  private players: Player[] = [];
  // 暂停
  isPause = true;

  constructor(game: Game, mainLoop: MainLoop) {
    this.mainLoop = mainLoop;
    if (game) {
      this.room = game.room;
      this.players = game.room.players;
    }
  }

  fixedUpdate(): void {
    if (this.isPause) {
      return;
    }

    const { players } = this;

    let frameCount = 0; // 此更新帧所有玩家的输入帧的数量
    players.forEach((player) => {
      frameCount += player.frameInputQueue[this.frameNo - 1]?.length || 0;
    });

    // 更新帧的字节布局：
    // <当前帧号(3B)>
    // <玩家1输入帧数量(1B)><玩家1输入帧对象组(输入帧数量 * 4B)>...
    // <玩家n输入帧数量(1B)><玩家n输入对象帧组(输入帧数量 * 4B)>
    const updateFrame = new ArrayBuffer(3 + players.length + frameCount * 4);
    const dv = new DataView(updateFrame);
    dv.setUint32(0, this.frameNo, true);
    let offset = 3;
    players.forEach((player) => {
      const inputQueue = player.frameInputQueue[this.frameNo - 1];
      if (inputQueue) {
        dv.setUint8(offset++, inputQueue.length);
        for (let i = 0; i < inputQueue.length; i++) {
          dv.setUint32(offset, inputQueue[i], true);
          offset += 4;
        }
      } else {
        dv.setUint8(offset++, 0);
      }
    });

    this.room!.broadcast(Buffer.from(updateFrame));
  
    this.frameNo++;
  }

  receiveFrameInput(data: Buffer, player: Player) {
    for (let b = 0, cnt = data.byteLength; b < cnt; b += 4) {
      const val = data.readUint32LE(b);
      const frameNo = val >> 8;
      if (!player.frameInputQueue[frameNo]) {
        player.frameInputQueue[frameNo] = [];
      }
      player.frameInputQueue[frameNo].push(val);
    }
  }
}