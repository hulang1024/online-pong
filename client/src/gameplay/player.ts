import Paddle from "./paddle";

export default class Player {
  id: number;
  paddle: Paddle;

  constructor(id: number) {
    this.id = id;
  }
}