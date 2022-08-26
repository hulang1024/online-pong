import { Request, Response, Router } from "express";
import Player from "../play/player";
import GameServer from "../game-server";
import { UserRequest } from "./user-controller";

export class RoomController {
  server: GameServer;

  constructor(router: Router, server: GameServer) {
    this.server = server;
    router.post('/room', this.create.bind(this));
    router.put('/room/:room_id/users/:user_id', this.join.bind(this));
    router.delete('/room/:room_id/users/:user_id', this.part.bind(this));
  }

  create(req: Request, res: Response) {
    const user = (req as UserRequest).user;
    const room = this.server.roomManager.create();
    room.createAt = new Date().getTime();
    room.creator = user;
    res.status(200).send(room);
  }

  join(req: Request, res: Response) {
    const userId = +req.params.user_id;
    const roomId = +req.params.room_id;
    const user = (req as UserRequest).user;
    if (userId != user.id) {
      res.status(400).end();
      return;
    }

    // 检查指定房间是否存在
    const roomToJoin = this.server.roomManager.get(roomId);
    if (roomToJoin == null) {
      res.status(400).end();
      return;
    }

    // 加入后成为 Player
    let player = this.server.playerManager.get(user.id);
    if (!player) {
      player = new Player(user);
    }

    if (player.joinedRoom()) {
      // 退出已加入的其它房间
      player.room.part(player);
    }

    // 加入
    roomToJoin.join(player);

    res.status(200).end();
  }

  part(req: Request, res: Response) {
    const userId = +req.params.user_id;
    const roomId = +req.params.room_id;
    const user = (req as UserRequest).user;
    if (userId != user.id) {
      res.status(400).end();
      return;
    }

    const roomToPart = this.server.roomManager.get(roomId);
    if (roomToPart == null) {
      res.status(400).end();
      return;
    }

    const player = this.server.playerManager.get(user.id);
    if (player && player.room.id == roomToPart.id) {
      roomToPart.part(player);
      player.quitGame();
      res.status(200).end();
    } else {
      res.status(400).end();
    }
  }
}