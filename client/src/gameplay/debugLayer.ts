import Game from "./game";

export function drawDebugInfo(game: Game) {
  const { context2d, gameStateSystem } = game;
  const { states } = gameStateSystem;
  let y = 0;
  const newLine = () => y += 20;

  context2d.save();
  context2d.textAlign = 'left';
  context2d.font = '14px pixel';
  context2d.fillStyle = '#00ff00';
  context2d.fillText(
    `Update FPS: ${game.updateFPS} (${(1000 / game.updateFPS).toFixed(1)}ms)`,
    16, newLine());
  context2d.fillText(
    `Server Update Frame: ${game.serverUpdateFrameNo}`, 16, newLine());
  context2d.fillText(
    `Server Update Delay: (${game.serverUpdateDelay.toFixed(1)}ms)`,
    16, newLine());
  context2d.fillText(`Ball Position: ${states.ballState.position}`,
    16, newLine());
  context2d.fillText(`Ball Velocity: ${states.ballState.vel}`, 16, newLine());
  game.players.forEach((_, i) => {
    context2d.fillText(
      `Paddle#${(i + 1)} Position: ${states.paddleStates[i].position}`,
      16, newLine(),
    );
  });
  context2d.restore();
}