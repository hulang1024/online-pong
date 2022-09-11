import Game from "../game";
import Player from "../player";
import Scene from "./scene";
import GameButton from "../../shared/game/input/gameButton";

export class ServeScene extends Scene {
  // 发球者
  server: Player;
  constructor(game: Game) {
    super('serve', game);
  }

  enter(player: Player): void {
    this.server = player;
  }

  update(_: number) {

    this.game.sceneManager.enter('play');
  }
}