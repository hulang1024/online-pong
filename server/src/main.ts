import { startHttpServer } from "./http-server";
import GameServer from "./game-server";

const server = new GameServer();
startHttpServer(server);
server.start(9999);