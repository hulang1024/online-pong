import { Request, Response, Router } from "express";
import GameServer from "../gameServer";
import User from "./user";
import { AuthRequest, createToken } from "../api/auth";

export default class UserController {
  server: GameServer;

  constructor(router: Router, server: GameServer) {
    this.server = server;
    router.get('/user', this.get.bind(this));
    router.get('/users', this.getUsers.bind(this));
    router.post('/user/login', this.login.bind(this));
  }

  get(req: Request, res: Response) {
    const user = (req as AuthRequest).auth.user;
    if (!this.server.userManager.get(user.id)) {
      this.server.userManager.add(user);
    }
    res.status(200).send({
      id: user.id
    });
  }

  getUsers(_: Request, res: Response) {
    const apiUsers = this.server.userManager.getUsers().map((user) => {
      return {
        id: user.id
      };
    });
    res.status(200).send(apiUsers);
  }

  login(req: Request, res: Response) {
    if (req.body.username == 'guest') {
      const user = new User((Math.floor(Date.now() / 1000)));
      this.server.userManager.add(user);
      res.status(200).send({
        token: createToken(user),
        user: {
          id: user.id
        }
      });
    } else {
      res.status(400).end();
    }
  }
}