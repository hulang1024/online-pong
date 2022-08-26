import { Request, Response, Router } from "express";
import GameServer from "../game-server";
import jwt from 'jsonwebtoken';
import User from "../user";

export const SECRET_KEY = 'login2022';

let UserId = 1;

export class UserController {
  server: GameServer;

  constructor(router: Router, server: GameServer) {
    this.server = server;
    router.post('/user/login', this.login.bind(this));
  }

  login(_: Request, res: Response) {
    const user = new User(UserId++);
    this.server.userManager.add(user);
  
    const token = jwt.sign({ user }, SECRET_KEY, { expiresIn: '3h' });
    res.status(200).send({
      token,
    });
  }
}

export interface UserRequest extends Request {
  user: User;
}