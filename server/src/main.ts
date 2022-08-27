import GameServer from "./game-server";
import { startAPIServer } from "./api/api-server";

const server = new GameServer();
startAPIServer(server, 8888);
server.start(9999);