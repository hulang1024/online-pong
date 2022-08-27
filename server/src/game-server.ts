import { WebSocket, Server, RawData } from 'ws';
import { UserManager } from './user/user';
import { verifyToken } from './api/auth';
import Player, { PlayerManager } from './gameplay/player';
import RoomManager from './room/room-manager';
import { GameManager } from './gameplay/game';
import MainLoop from './gameplay/main-loop';

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

      ws.on('close', () => {
        //connectedClients.delete(ws);
      });

      ws.on('pong', () => {

      });

      let player: Player | null = null;

      ws.on('message', (data: RawData, isBinary: boolean) => {
        if (isBinary) {
          // 只有帧同步数据用二进制
          player!.game!.gameLoop.addInputFrame(data as Buffer, player!);
        } else {
          let authResult = 1;
          const jsonMsg = JSON.parse(data.toString()) as MessageEvent;
          if (jsonMsg.type == 'auth') {
            let payload;
            if (payload = verifyToken((jsonMsg as any).token)) {
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
          }
        }
      });
    });
  }
}


interface MessageEvent {
  type: string;
}