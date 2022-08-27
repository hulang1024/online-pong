export default class User {
  id: number;

  static readonly Null = new User(0);

  constructor(id: number) {
    this.id = id;
  }
}

export class UserManager {
  private idToUser = new Map<number, User>();

  add(user: User) {
    this.idToUser.set(user.id, user);
  }

  get(id: number) {
    return this.idToUser.get(id);
  }
}