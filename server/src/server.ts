import { WebSocket, Server, RawData } from 'ws';
import GamePlayHandler from './game-play';
import Player, { PlayerManager } from './player';
import { RoomManager } from './room';

export default class GameServer {
  wsServer: Server<WebSocket> | null = null;
  playerManager = new PlayerManager();
  roomManager = new RoomManager();

  start(port: number) {
    this.wsServer = new Server({
      port
    });

    const gamePlayHandler = new GamePlayHandler(this);

    // Test
    const room = this.roomManager.create();

    this.wsServer.on('close', () => {
      console.log('close');
    });
    this.wsServer.on('connection', (ws, req) => {
      const uid = parseInt(req.url?.substring(6)!);
      if (isNaN(uid)) {
        ws.close();
        return;
      }

      console.debug('%s connection', uid);

      let player = this.playerManager.get(uid);
      if (player) {
        player.client = ws;
      } else {
        player = new Player(uid, ws);
        this.playerManager.add(player);
      }
      if (room.players.length < 2) {
        room.add(player);
      }

      ws.on('message', (data: RawData, isBinary: boolean) => {
        // 在不同机器上此处判断不同，存疑
        if (isBinary) {
          gamePlayHandler.onFrame(data as Buffer, player!);
        } else {
          const jsonMsg = data.toString();
          const msg = JSON.parse(jsonMsg);
          if (msg.type == 'start') {
            console.log('start');
            gamePlayHandler.stopFrameLoop();
            gamePlayHandler.clearFrames();
            gamePlayHandler.startFrameLoop();
          }
          room.players.forEach((player) => {
            if (player.client.readyState === 1) {
              player.client.send(jsonMsg);
            }
          });
        }
      });
    });
  }
}
