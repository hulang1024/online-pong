// 每帧固定更新时长
export const SECONDS_PER_FRAME = 1 / 60;

// 以固定时长更新的对象
export interface FixedUpdatable {
  fixedUpdate(delta: number): void;
}

// 动态渲染的对象
export interface Drawable {
  draw(delta: number): void;
}

export default class GameLoop {
  private fixedUpdatables: FixedUpdatable[] = [];
  private drawables: Drawable[] = [];
  private isStarted = false;

  start() {
    if (this.isStarted) {
      return;
    }
    this.isStarted = true;

    const { fixedUpdatables, drawables } = this;

    let lastTime = 0;
    let deltaTime = 0;
    let lag = 0; // 游戏时间相对于实际时间的延迟

    const loop = (nowTime: number) => {
      deltaTime = (nowTime - lastTime) * 0.001;
      lastTime = nowTime;
      lag += deltaTime;

      // 缓存长度，避免循环过程中改变，因为本帧中就可能会产生新对象，
      // 但不希望新对象在本帧中就有机会活动
      let cnt = fixedUpdatables.length;
      while (lag >= SECONDS_PER_FRAME) {
        for (let i = 0; i < cnt; i++) {
          fixedUpdatables[i].fixedUpdate(SECONDS_PER_FRAME);
        }
        lag -= SECONDS_PER_FRAME;
      }

      cnt = drawables.length;
      for (let i = 0; i < cnt; i++) {
        drawables[i].draw(lag);
      }

      requestAnimationFrame(loop); 
    };

    requestAnimationFrame((nowTime: number) => {
      lastTime = nowTime;
      requestAnimationFrame(loop);
    });
  }

  add(o: FixedUpdatable & Drawable) {
    this.addFixedUpdatable(o);
    this.addDrawable(o);
  }

  addFixedUpdatable(o: FixedUpdatable) {
    if (!this.fixedUpdatables.includes(o)) {
      this.fixedUpdatables.push(o);
    }
  }

  addDrawable(o: Drawable) {
    if (!this.drawables.includes(o)) {
      this.drawables.push(o);
    }
  }
}