import Player from "./player";
import Game from "./game";
import { FixedUpdatable } from "./main-loop";

export default class GameLoop implements FixedUpdatable {
  // 当前帧号
  private frameNo = 0;
  // 帧间隔
  private intervel = 2;
  // update累积毫秒时长
  private timer = 0;
  // 是否暂停
  private isPause = true;
  // 游戏内玩家
  private players: Player[] = [];

  constructor(game: Game) {
    this.players = game.room.players;
  }

  fixedUpdate(delta: number) {
    if (this.isPause) {
      return;
    }

    this.timer += delta;
    if (this.timer < this.intervel / 60 * 1000) {
      return;
    }

    const { players } = this;

    console.log('frame', this.frameNo);
    if (this.frameNo > this.intervel) {
      for (const player of players) {
        //console.log('player %d frame.length', player.id, player.frames.length);
        const lastFrame = player.frames[player.frames.length - 1];
        if ((lastFrame & 0xFFFFFF) + this.intervel < this.frameNo - 1) {
          return;
        }
      }
    }

    // 遍历房间内所有玩家
    for (const player of players) {
      let updateFrame = new ArrayBuffer(6
        + (players.length - 1)
        + (players.length - 1) * this.intervel * 4);
      let dv = new DataView(updateFrame);
      dv.setUint32(0, this.frameNo, true);
      dv.setUint32(3, this.frameNo + this.intervel, true);
      let offset = 6;
      if (this.frameNo < this.intervel * 2) {
        for (let i = 0; i < players.length; i++) {
          if (players[i] != player)
            dv.setUint8(offset++, 0);
        }
      } else {
        for (let i = 0; i < players.length; i++) {
          if (players[i] != player)
            dv.setUint8(offset++,  this.intervel);
        }
      }
      players.forEach((other: Player) => {
        if (player != other) {
          const otherFrames = other.frames;
          // 读倒数第n个，注意：此种方式未判断帧号，依赖于前端在锁定第n个帧时不推送输入
          for (let fi = otherFrames.length - this.intervel;
            fi < otherFrames.length; fi++) {
            const frame = otherFrames[fi];
            dv.setUint32(offset, frame, true);
            offset += 4;
          }
        }
      });
      
      if (player.client.readyState == 1) {
        // 发送同房间其它玩家的帧
        player.client.send(Buffer.from(updateFrame));
      }
    }
  
    this.frameNo += this.intervel;
  }

  
  addInputFrame(data: Buffer, player: Player) {
    for (let i = 0, cnt = data.byteLength / 4; i < cnt; i++) {
      player.frames.push(data.readUint32LE(i * 4));
    }
  }
}