import express, { Request, Response } from "express";
import { SECRET_KEY } from "../api/auth";
import { expressjwt } from 'express-jwt';
import GameServer from "../game-server";
import RoomController from "../room/room-controller";
import UserController from "../user/user-controller";
import GameController from "../game-controller";

const app = express();

app.all('*', function(req, res, next){
  res.header('Access-Control-Allow-Origin','*');
  res.header('Access-Control-Allow-Headers','*');
  res.header('Access-Control-Allow-Methods','DELETE,PUT,POST,GET,OPTIONS');
  if (req.method.toLowerCase() == 'options') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

const router = express.Router();
router.use(
  expressjwt({
    secret: SECRET_KEY,
    algorithms: ['HS256'],
  })
  .unless({ path: ['/user/login'] })
);

router.use(function (err: any, _: Request, res: Response, next: any) {
  if (err.name === 'UnauthorizedError') {   
    res.status(401).send({ msg: 'invalid token' })
  } else {
    res.status(400).end();
  }
});
app.use(router);

export function startAPIServer(server: GameServer, port: number) {
  new UserController(router, server);
  new RoomController(router, server);
  new GameController(router, server);

  app.listen(port, () => {
    console.log(`APIServer已启动, 监听端口${port}`);
  });
}