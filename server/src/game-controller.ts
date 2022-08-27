import { Request, Response, Router } from "express";
import GameServer from "./game-server";
import { AuthRequest } from "./api/auth";
import { GameState } from "./gameplay/game";

export default class GameController {
  server: GameServer;

  constructor(router: Router, server: GameServer) {
    this.server = server;
    router.post('/game/start', this.start.bind(this));
    router.post('/game/pause', this.pause.bind(this));
    router.post('/game/resume', this.resume.bind(this));
  }

  start(req: Request, res: Response) {
    const user = (req as AuthRequest).auth.user;
    const player = this.server.playerManager.get(user.id);
    if (!player) {
      return res.status(400).send({ code: 1, msg: '未找到玩家' });
    } else if (player.game && player.game.state != GameState.Ready) {
      return res.status(400).send({ code: 2, msg: '状态验证失败' });
    } else if (!player.room) {
      return res.status(400).send({ code: 3, msg: '未加入房间' });
    } else if (player.room.countPlayer() < 2) {
      return res.status(400).send({ code: 4, msg: '开始游戏需要至少两个玩家' });
    } else if (player.room.players.some((p) => !p.isOnline())) {
      return res.status(400).send({ code: 5, msg: '房间内有用户未连接到服务器' });
    }

    const game = this.server.gameManager.create(player.room);
    player.room.players.forEach((player) => {
      player.game = game;
    });
    game.start(this.server);
    res.status(200).end();
  }

  pause(req: Request, res: Response) {
    const user = (req as AuthRequest).auth.user;
    const player = this.server.playerManager.get(user.id);
    if (!player) {
      return res.status(400).send({ code: 1, msg: '未找到玩家' });
    } else if (!player.game) {
      return res.status(400).send({ code: 2, msg: '未加入游戏' });
    } else if (player.game.state != GameState.Playing) {
      return res.status(400).send({ code: 3, msg: '游戏不在进行中' });
    }

    player.game.pause();
    res.status(200).end();
  }

  resume(req: Request, res: Response) {
    const user = (req as AuthRequest).auth.user;
    const player = this.server.playerManager.get(user.id);
    if (!player) {
      return res.status(400).send({ code: 1, msg: '未找到玩家' });
    } else if (!player.game) {
      return res.status(400).send({ code: 2, msg: '未加入游戏' });
    } else if (player.game.state != GameState.Paused) {
      return res.status(400).send({ code: 3, msg: '游戏不在暂停状态' });
    }

    player.game.resume();
    res.status(200).end();
  }
}