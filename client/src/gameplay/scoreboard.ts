import GameStates from "../shared/game/states";
import Viewport from "../shared/game/viewport";

export default class Scoreboard {
  gameStates: GameStates;
  viewport: Viewport;
  context2d: CanvasRenderingContext2D;

  draw() {
    const textSize = 48;
    const offsetX = 40;
    const offsetY = 40;
    const centerY = this.viewport.height / 2 + 14;
    this.context2d.font = `${textSize}px pixel`;
    this.context2d.textAlign = 'left';
    this.context2d.fillText(this.gameStates.score1 + '',
      offsetX, centerY - offsetY);
    this.context2d.fillText(this.gameStates.score2 + '',
      offsetX, centerY + offsetY);
  }
}