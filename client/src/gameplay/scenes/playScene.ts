import Game from "../game";
import Scene from "./scene";

export class PlayScene extends Scene {
  game: Game;
  constructor(game: Game) {
    super('play', game);
  }
}