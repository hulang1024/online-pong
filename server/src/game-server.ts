import { WebSocket, Server, RawData } from 'ws';
import { UserManager } from './user';
import { PlayerManager } from './play/player';
import { RoomManager } from './room/room';
import { GameManager } from './play/game';
import MainLoop from './play/main-loop';

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
    });

    const userManager = this.userManager;
    const playerManager = this.playerManager
    //const connectedClients = new Set<WebSocket>();

    this.wsServer.on('connection', (ws) => {
      console.debug('connection');
      //connectedClients.add(ws);

      ws.on('close', () => {
        //connectedClients.delete(ws);
      });

      ws.on('pong', () => {

      });

      const user = userManager.get(ws);

      ws.on('message', (data: RawData, isBinary: boolean) => {
        if (isBinary) {
          // 只有帧同步数据用二进制
          if (user != null) {
            // todo: 优化get player性能
            const player = playerManager.get(user.id);
            player?.game?.gameLoop.addInputFrame(data as Buffer, player);
          }
        }
      });
    });
  }
}
