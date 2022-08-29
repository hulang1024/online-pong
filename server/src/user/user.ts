export default class User {
  id: number;

  static readonly Null = new User(0);

  constructor(id: number) {
    this.id = id;
  }
}

export class UserManager {
  private users: User[] = [];
  private userMap = new Map<number, User>();

  add(user: User) {
    if (!this.userMap.has(user.id)) {
      this.users.push(user);
      this.userMap.set(user.id, user);
    }
  }

  get(id: number) {
    return this.userMap.get(id);
  }

  getUsers() {
    return this.users;
  }
}