import Player from "./player";
import Game from "./game";
import { FixedUpdatable } from "./main-loop";
import Room from "../room/room";

export default class GameLoop implements FixedUpdatable {
  // 当前帧号
  private frameNo = 0;
  // 帧间隔
  private intervel = 1;
  private intervelMS= 0;
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

    this.setIntervel(3);
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

    if (this.frameNo > this.intervel) {
      for (const player of players) {
        //console.log('player %d frame.length', player.id, player.frames.length);
        const lastFrame = player.frames[player.frames.length - 1];
        if ((lastFrame & 0xFFFFFF) + this.intervel < this.frameNo - 1) {
          return;
        }
      }
    }

    const updateFrame = new ArrayBuffer(
      6 + players.length + players.length * this.intervel * 4);
    const dv = new DataView(updateFrame);
    dv.setUint32(0, this.frameNo, true);
    dv.setUint32(3, this.frameNo + this.intervel, true);
    let offset = 6;
    // 遍历房间内所有玩家
    if (this.frameNo < this.intervel * 2) {
      players.forEach((_) => {
        dv.setUint8(offset++,  0);
      });
    } else {
      players.forEach((player) => {
        dv.setUint8(offset++,  this.intervel);
        const otherFrames = player.frames;
        // 读倒数第n个，注意：此种方式未判断帧号，依赖于前端在锁定第n个帧时不推送输入
        for (let fi = otherFrames.length - this.intervel;
          fi < otherFrames.length; fi++) {
          dv.setUint32(offset, otherFrames[fi], true);
          offset += 4;
        }
      });
    }

    this.room!.broadcast(Buffer.from(updateFrame));
  
    this.frameNo += this.intervel;
  }

  setIntervel(val: number) {
    this.intervel = val;
    this.intervelMS = this.intervel / 60 * 1000;
  }
  
  addInputFrame(data: Buffer, player: Player) {
    for (let i = 0, cnt = data.byteLength / 4; i < cnt; i++) {
      player.frames.push(data.readUint32LE(i * 4));
    }
  }
}