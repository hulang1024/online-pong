import TWEEN from  'tween.ts';

// 每帧固定更新时长
const FPS = 60;
export const S_PER_UPDATE = 1 / FPS;

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
  private isStarted = false;
  private fixedUpdates: FixedUpdate[] = [];
  private draws: Draw[] = [];

  start() {
    if (this.isStarted) {
      return;
    }
    this.isStarted = true;

    const { fixedUpdates, draws } = this;

    let lastTime = 0;
    let elapsed = 0;
    let lag = 0; // 游戏时间相对于实际时间的延迟

    const loop = (nowTime: number) => {
      TWEEN.update(nowTime);
      elapsed = (nowTime - lastTime) * 0.001;
      lastTime = nowTime;
      lag += elapsed;

      // 缓存长度，避免循环过程中改变，因为本帧中就可能会产生新对象，
      // 但不希望新对象在本帧中就有机会活动
      let cnt = fixedUpdates.length;
      while (lag >= S_PER_UPDATE) {
        for (let i = 0; i < cnt; i++) {
          fixedUpdates[i](S_PER_UPDATE);
        }
        lag = lag - S_PER_UPDATE;
      }

      cnt = draws.length;
      for (let i = 0; i < cnt; i++) {
        draws[i](elapsed);
      }

      requestAnimationFrame(loop); 
    };

    requestAnimationFrame((nowTime: number) => {
      lastTime = nowTime;
      requestAnimationFrame(loop);
    });
  }

  add(o: FixedUpdatable & Drawable) {
    this.addFixedUpdate(o.fixedUpdate.bind(o));
    this.addDraw(o.draw.bind(o));
  }

  addDraw(f: Draw) {
    if (!this.draws.includes(f)) {
      this.draws.push(f);
    }
  }

  addFixedUpdate(f: FixedUpdate) {
    if (!this.fixedUpdates.includes(f)) {
      this.fixedUpdates.push(f);
    }
  }
}

export interface Loop {
  start(): void;
}