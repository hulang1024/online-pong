import { WebSocket } from "ws";

export default class User {
  id: number;

  constructor(id: number) {
    this.id = id;
  }
}

export const NullUser = new User(0);

export class UserManager {
  users: User[] = [];
  clientToUser: Map<WebSocket, User> = new Map();

  add(user: User) {
    this.users.push(user);
    this.clientToUser.set(user.client, user);
  }

  get(key: WebSocket) {
    return this.clientToUser.get(key);
  }

  del(key: WebSocket) {
    this.clientToUser.delete(key);
  }
  
  count() {
    return this.clientToUser.size;
  }
}