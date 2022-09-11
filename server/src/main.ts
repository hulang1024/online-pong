import GameServer from "./gameServer";
import { startAPIServer } from "./api/apiServer";

const server = new GameServer();
startAPIServer(server, 8888);
server.start(9999);