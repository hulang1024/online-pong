import Player, { EMPTY_INPUTS } from "./player";
import Game from "./game";
import MainLoop, { FixedUpdatable } from "./main-loop";
import Room from "../room/room";

export default class GameLoop implements FixedUpdatable {
  mainLoop: MainLoop
  fps = 50;
  // 每帧间隔多少毫秒
  msPerFrame = 60 / this.fps / 60 * 1000;
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

    // 计算本帧所有玩家的输入帧的总数量
    let totalFrames = 0;
    // 遍历房间内所有玩家
    players.forEach((player) => {
      if (player.frameInputQueue[this.frameNo]) {
        // 如果当前帧已收到数据，计数
        totalFrames += player.frameInputQueue[this.frameNo].length;
      } else {
        // 如果还没有收到数据，不等待，视本帧为空输入
        player.frameInputQueue[this.frameNo] = EMPTY_INPUTS;
      }
    });

    // 更新帧的字节布局：
    // <当前帧号(3B)>
    // <玩家1输入帧数量(1B)><玩家1输入帧对象组(输入帧数量 * 4B)>...
    // <玩家n输入帧数量(1B)><玩家n输入对象帧组(输入帧数量 * 4B)>
    const updateFrame = new ArrayBuffer(3 + players.length + totalFrames * 4);
    const dv = new DataView(updateFrame);
    // 写当前帧号
    dv.setUint32(0, this.frameNo, true);
    let offset = 3;
    // 遍历房间内所有玩家
    players.forEach((player) => {
      const inputQueue = player.frameInputQueue[this.frameNo];
      // 写输入帧数量
      dv.setUint8(offset++, inputQueue.length);
      // 写输入帧对象数组
      for (let i = 0; i < inputQueue.length; i++) {
        dv.setUint32(offset, inputQueue[i], true);
        offset += 4;
      }
    });

    // 发送给房间内所有玩家
    this.room!.broadcast(Buffer.from(updateFrame));
  
    // 递增下一个帧号
    this.frameNo++;
  }

  receiveFrameInput(data: Buffer, player: Player) {
    for (let b = 0, cnt = data.byteLength; b < cnt; b += 4) {
      const val = data.readUint32LE(b);
      // 读客户端发送输入时其所在帧号。
      // 因为第n帧发送第n-1帧的数据，加1方便更新过程通过this.frameNo访问当前帧要发送的数据
      const frameNo = (val >> 8) + 1;
      // 比当前帧号小，将不能记录此数据，因为服务端已记录历史为空输入
      // 其它客户端已收到空输入，因此现在不能覆盖历史
      if (frameNo < this.frameNo) {
        // 过时，跳过该数据
        break;
      }
      // 如果未过时
      let inputQueue = player.frameInputQueue[frameNo];
      // 以防万一，仍要检查已是历史空输入
      if (inputQueue === EMPTY_INPUTS) {
        break;
      } else if (!inputQueue) {
        // 更新过程未填充过数据，现在初始化为空
        inputQueue = player.frameInputQueue[frameNo] = [];
        inputQueue.push(val);
      } else {
        // 此帧已有输入数据，可以继续追加
        inputQueue.push(val);
      }
    }
  }
}