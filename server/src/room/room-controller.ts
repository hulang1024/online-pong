import { Request, Response, Router } from "express";
import GameServer from "../game-server";
import { AuthRequest } from "../api/auth";

export default class RoomController {
  server: GameServer;

  constructor(router: Router, server: GameServer) {
    this.server = server;
    router.post('/room', this.create.bind(this));
    router.get('/rooms', this.getRooms.bind(this));
    router.put('/room/:room_id/users/:user_id', this.join.bind(this));
    router.delete('/room/:room_id/users/:user_id', this.part.bind(this));
    router.get('/room/:room_id/users', this.getUsers.bind(this));
  }

  create(req: Request, res: Response) {
    const user = (req as AuthRequest).auth.user;
    const room = this.server.roomManager.create();
    room.createAt = new Date().getTime();
    room.creator = user;
    const ret = this.server.roomManager
      .join(user, room.id, this.server.playerManager);
    if (ret == 0) {
      res.status(200).send({id: room.id});
    } else {
      res.status(400).send({ code: ret });
    }
  }

  getRooms(_: Request, res: Response) {
    const apiRooms: any[] = [];
    this.server.roomManager.rooms.forEach((room) => {
      apiRooms.push({
        id: room.id,
        creatorId: room.creator.id,
        createAt: room.createAt,
        players: room.players.map((player) => ({ id: player.id })),
        gameState: room.game?.state,
      });
    });
    res.status(200).send(apiRooms);
  }

  join(req: Request, res: Response) {
    const userId = +req.params.user_id;
    const roomId = +req.params.room_id;
    const user = (req as AuthRequest).auth.user;
    if (userId != user.id) {
      return res.status(401).end();
    }

    const ret = this.server.roomManager
      .join(user, roomId, this.server.playerManager);
    if (ret == 0) {
      res.status(200).end();
    } else if (ret == 1) {
      res.status(404);
    } else {
      res.status(400).send({ code: ret });
    }
  }

  part(req: Request, res: Response) {
    const userId = +req.params.user_id;
    const roomId = +req.params.room_id;
    const user = (req as AuthRequest).auth.user;
    if (userId != user.id) {
      return res.status(401).end();
    }

    this.server.roomManager.part(user, roomId, this.server.playerManager);
  }

  getUsers(req: Request, res: Response) {
    const roomId = +req.params.room_id;
    const room = this.server.roomManager.get(roomId);
    if (!room) {
      return res.status(404).end();
    }

    const apiPlayers = room.players.map((player) => ({
      id: player.id,
      online: player.isOnline(),
    }));
    res.status(200).send(apiPlayers);
  }
}