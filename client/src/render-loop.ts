import { Draw, Loop } from "./game-loop";

export default class RenderLoop implements Loop {
  private draws: Draw[] = [];

  start() {
    const { draws } = this;

    let lastTime = 0;
    let deltaTime = 0;

    const loop = (nowTime: number) => {
      deltaTime = (nowTime - lastTime) * 0.001;
      lastTime = nowTime;
  
      const cnt = draws.length;
      for (let i = 0; i < cnt; i++) {
        draws[i](deltaTime);
      }

      requestAnimationFrame(loop); 
    };

    requestAnimationFrame((nowTime: number) => {
      lastTime = nowTime;
      requestAnimationFrame(loop);
    });
  }

  addDraw(f: Draw) {
    if (!this.draws.includes(f)) {
      this.draws.push(f);
    }
  }
}