import Player from "./player";
import GameServer from "./server";

export default class GamePlayHandler {
  server: GameServer;
  frameNo = 0;
  timer: NodeJS.Timer | null = null;

  constructor(server: GameServer) {
    this.server = server;
  }

  stopFrameLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  clearFrames() {
    this.server.playerManager.players.forEach((player) => {
      player.frames = [];
    });
  }

  startFrameLoop() {
    if (this.timer) {
      return;
    }
    const keyFrameIntervel = 2;
    this.frameNo = 0;
    const players = this.server.playerManager.players;
    const sendFrames = () => {
      console.log('frame', this.frameNo);
      for (const player of players) {
        // 向同房间的玩家发送其它玩家的帧
        const roomPlayers = player.room.players;

        if (this.frameNo > keyFrameIntervel) {
          for (const player of roomPlayers) {
            //console.log('player %d frame.length', player.id, player.frames.length);
            if ((player.frames[player.frames.length - 1] & 0xFFFFFF) + keyFrameIntervel < this.frameNo - 1) {
              return;
            }
          }
        }
 
        let updateFrame = new ArrayBuffer(6
          + (roomPlayers.length - 1)
          + (roomPlayers.length - 1) * keyFrameIntervel * 4);
        let dv = new DataView(updateFrame);
        dv.setUint32(0, this.frameNo, true);
        dv.setUint32(3, this.frameNo + keyFrameIntervel, true);
        let offset = 6;
        if (this.frameNo < keyFrameIntervel * 2) {
          for (let i = 0; i < roomPlayers.length; i++) {
            if (roomPlayers[i] != player)
              dv.setUint8(offset++, 0);
          }
        } else {
          for (let i = 0; i < roomPlayers.length; i++) {
            if (roomPlayers[i] != player)
              dv.setUint8(offset++,  keyFrameIntervel);
          }
        }
        roomPlayers.forEach((other: Player) => {
          if (player != other) {
            const otherFrames = other.frames;
            // 读倒数第n个，注意：此种方式未判断帧号，依赖于前端在锁定第n个帧时不推送输入
            for (let fi = otherFrames.length - keyFrameIntervel;
              fi < otherFrames.length; fi++) {
              const frame = otherFrames[fi];
              dv.setUint32(offset, frame, true);
              offset += 4;
            }
          }
        });
        if (player.client.readyState == 1) {
          player.client.send(Buffer.from(updateFrame));
        }
      }
      this.frameNo += keyFrameIntervel;
    };

    this.timer = setInterval(sendFrames, keyFrameIntervel / 60 * 1000);
  }

  onFrame(data: Buffer, player: Player) {
    for (let i = 0, cnt = data.byteLength / 4; i < cnt; i++) {
      player.frames.push(data.readUint32LE(i * 4));
    }
  }
}