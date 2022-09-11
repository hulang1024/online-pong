import Paddle from "./renderers/paddle";

export default class Player {
  id: number;
  paddle: Paddle;

  constructor(id: number) {
    this.id = id;
  }
}