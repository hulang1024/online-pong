import APIAccess from './api/api';
import Game from './gameplay/game';
import Player from './gameplay/player';
import MainLoop from './main-loop';
import SocketClient from './ws';

window.addEventListener('load', () => {
  const loadingEl = document.getElementById('loading');

  const apiAccess = new APIAccess();
  apiAccess.auth()
    .then(async () => {
      loadingEl.style.display = 'none';

      const socketClient = new SocketClient(apiAccess);

      const game = new Game(apiAccess, socketClient);

      socketClient.onMessage((msg) => {
        if (msg.type == 'start') {
          apiAccess.http.get(`/room/1/users`).then((ret) => {
            game.start(ret.data as Player[]);
          });
        }
      });

      apiAccess.http.put(
        `/room/1/users/${apiAccess.localUser.id}`);

      const mainLoop = new MainLoop();
      mainLoop.objects.push(game);
      mainLoop.start();
    })
    .catch((e) => {
      console.error(e);
      alert('验证失败');
    });
});