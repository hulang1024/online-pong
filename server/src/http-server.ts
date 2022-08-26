import express from "express";
import parseJwt from 'express-jwt';
import { RoomController } from "./room/room-controller";
import { SECRET_KEY, UserController } from "./room/user-controller";
import GameServer from "./game-server";

const router = express.Router();

router.use(
  parseJwt.expressjwt({
    secret: SECRET_KEY,
    algorithms: ['HS256'],
  })
  .unless({ path: ['/user/login'] })
)
export function startHttpServer(server: GameServer) {
  new UserController(router, server);
  new RoomController(router, server);
}