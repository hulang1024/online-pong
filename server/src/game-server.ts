import { WebSocket, Server, RawData } from 'ws';
import { UserManager } from './user/user';
import { verifyToken } from './api/auth';
import Player, { PlayerManager } from './gameplay/player';
import RoomManager from './room/room-manager';
import { GameManager } from './gameplay/game';
import MainLoop from './gameplay/main-loop';
import GameLoop from './gameplay/game-loop';

export default class GameServer {
  wsServer: Server<WebSocket> | null = null;
  mainLoop = new MainLoop();
  gameManager = new GameManager();
  userManager = new UserManager();
  roomManager = new RoomManager();
  playerManager = new PlayerManager();

  start(port: number) {
    this.wsServer = new Server({
      port
    }, () => {
      console.log(`GameServer已启动. 监听端口${port}`);
    });

    const playerManager = this.playerManager
    //const connectedClients = new Set<WebSocket>();

    this.wsServer.on('connection', (ws) => {
      //connectedClients.add(ws);
      let player: Player | null = null;
      let gameLoop: GameLoop;

      ws.on('close', () => {
        //connectedClients.delete(ws);
        if (player) {
          player.room.broadcastMsg({
            type: 'room.user.offline',
            data: { id: player.id }
          });
        }
      });

      ws.on('pong', () => {

      });


      ws.on('message', (data: RawData, isBinary: boolean) => {
        if (isBinary) {
          // 只有帧同步数据用二进制
          gameLoop?.receiveFrameInput(data as Buffer, player!);
        } else {
          let authResult = 1;
          const msg = JSON.parse(data.toString()) as MessageEvent;
          if (msg.type == 'auth') {
            let payload;
            if (payload = verifyToken((msg as any).token)) {
              const authUser = (payload as any).user;
              player = playerManager.get(authUser.id)!;
              if (player) {
                player.client = ws;
                authResult = 0;
              } else {
                authResult = 2;
              }
            } else {
              authResult = 1;
            }
            ws.send(JSON.stringify(authResult == 0
              ? { type: 'auth', code: authResult, msg: 'success' }
              : { type: 'auth', code: authResult, msg: 'failed' }));
          } else if (msg.type == 'ready-recv-frame') {
            if (player?.game) {
              gameLoop = player!.game?.gameLoop;
              player.isReadyRecvFrame = true;
              player.game.start();
            }
          }
        }
      });
    });
  }
}


interface MessageEvent {
  type: string;
}