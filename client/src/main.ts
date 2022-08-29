import APIAccess from './api/api';
import Game from './gameplay/game';
import Player from './gameplay/player';
import MainLoop from './main-loop';
import { User } from './user';
import { parseSearchParams } from './utils';
import SocketClient, { MsgEvent } from './ws';

window.addEventListener('load', () => {
  const loadingEl = document.getElementById('loading');

  const apiAccess = new APIAccess();
  apiAccess.auth()
    .then(async () => {
      loadingEl.style.display = 'none';

      const roomId = parseSearchParams().room_id;
      if (!roomId) {
        alert('未指定房间id');
        return;
      }
      await apiAccess.http.put(
        `/room/${roomId}/users/${apiAccess.localUser.id}`);

      const socketClient = new SocketClient(apiAccess);

      const game = new Game(apiAccess, socketClient);

      socketClient.onMessage((msg) => {
        if (!(msg instanceof MsgEvent)) {
          return;
        }
        if (msg.type == 'start') {
          // start会发多次
          if (!game.isStarted) {
            apiAccess.http.get(`/room/${roomId}/users`).then((ret) => {
              game.start(ret.data as Player[]);
            });
          }
        } else if (msg.type == 'pause') {
          alert('游戏暂停');
        } else if (msg.type == 'stop') {
          alert('游戏停止');
        } else if (msg.type.startsWith('room')) {
          if (msg.type == 'room.user.offline') {
            const user = msg.data as User;
            alert(user.id + ' offline');
          }
        }
      });

      const mainLoop = new MainLoop();
      mainLoop.objects.push(game);
      mainLoop.start();
    })
    .catch((e) => {
      console.error(e);
      alert('验证失败');
    });
});