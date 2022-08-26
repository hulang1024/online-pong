import { Request, Response, Router } from "express";
import GameServer from "../game-server";
import { UserRequest } from "./user-controller";

export class GameController {
  server: GameServer;

  constructor(router: Router, server: GameServer) {
    this.server = server;
    router.post('/game/start', this.start.bind(this));
  }

  start(req: Request, res: Response) {
    const user = (req as UserRequest).user;
    const player = this.server.playerManager.get(user.id);
    if (player && player.game) {
      const game = this.server.gameManager.create(player.room);
      game.start(this.server);
      res.status(200).end();
    } else {
      res.status(400).end();
    }
  }
}