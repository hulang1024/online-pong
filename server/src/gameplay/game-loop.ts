import Player from "./player";
import Game from "./game";
import { FixedUpdatable } from "./main-loop";
import Room from "../room/room";

export default class GameLoop implements FixedUpdatable {
  // 当前更新帧号
  private frameNo = 0;
  // 更新帧间隔
  private intervelMS = 3 / 60 * 1000;
  // update累积毫秒时长
  private updateTime = 0;
  private room: Room | null = null;
  // 游戏内玩家
  private players: Player[] = [];
  isPause = true;

  constructor(game: Game) {
    if (!game) {
      return;
    }
    this.room = game.room;
    this.players = game.room.players;
  }

  fixedUpdate(delta: number) {
    if (this.isPause) {
      return;
    }

    this.updateTime += delta;
    if (this.updateTime < this.intervelMS) {
      return;
    }

    const { players } = this;

    let frameCount = 0; // 此更新帧所有玩家的输入帧的数量
    players.forEach((player) => {
      frameCount += player.inputQueue.length;
    });

    const updateFrame = new ArrayBuffer(3 + players.length + frameCount);
    const dv = new DataView(updateFrame);
    dv.setUint32(0, this.frameNo, true);
    let offset = 3;
    players.forEach((player) => {
      dv.setUint8(offset++, player.inputQueue.length);
      // 读倒数第n个，注意：此种方式未判断帧号，依赖于前端在锁定第n个帧时不推送输入
      for (let i = 0; i < player.inputQueue.length; i++) {
        dv.setUint8(offset++, player.inputQueue[i]);
      }
      player.inputQueue.length = 0;
    });

    this.room!.broadcast(Buffer.from(updateFrame));
  
    this.frameNo++;
  }

  receiveFrameInput(data: Buffer, player: Player) {
    for (let i = 0, cnt = data.byteLength; i < cnt; i++) {
      player.inputQueue.push(data.readUint8(i));
    }
  }
}