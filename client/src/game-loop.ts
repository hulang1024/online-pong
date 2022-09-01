import RenderLoop from "./render-loop";
import UpdateLoop from "./update-loop";

export type FixedUpdate = (delta: number) => void;
export type Draw = (delta: number) => void;

// 动态渲染的对象
interface Drawable {
  draw: Draw;
}

// 以固定时长更新的对象
interface FixedUpdatable {
  fixedUpdate: FixedUpdate;
}

export default class GameLoop {
  private updateLoop = new UpdateLoop();
  private renderLoop = new RenderLoop();
  private isStarted = false;

  start() {
    if (this.isStarted) {
      return;
    }
    this.isStarted = true;

    this.updateLoop.start();
    this.renderLoop.start();
  }

  add(o: FixedUpdatable & Drawable) {
    this.updateLoop.addFixedUpdate(o.fixedUpdate.bind(o));
    this.renderLoop.addDraw(o.draw.bind(o));
  }
}

export interface Loop {
  start(): void;
}