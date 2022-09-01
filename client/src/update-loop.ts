import { FixedUpdate, Loop } from "./game-loop";

// 每帧固定更新时长
export const MS_PER_FRAME = 1000 / 60;

export default class UpdateLoop implements Loop {
  private fixedUpdates: FixedUpdate[] = [];
  private timer = 0;

  start() {
    if (this.timer) return;

    const { fixedUpdates } = this;

    let nowTime = 0;
    let lastTime = 0;
    let elapsed = 0;
    let lag = 0; // 游戏时间相对于实际时间的延迟

    const loop = () => {
      nowTime = new Date().getTime();
      elapsed = nowTime - lastTime;
      lastTime = nowTime;
      lag += elapsed;

      // 缓存长度，避免循环过程中改变，因为本帧中就可能会产生新对象，
      // 但不希望新对象在本帧中就有机会活动
      let cnt = fixedUpdates.length;
      while (lag >= MS_PER_FRAME) {
        for (let i = 0; i < cnt; i++) {
          fixedUpdates[i](MS_PER_FRAME * 0.001);
        }
        lag -= MS_PER_FRAME;
      }
    };

    lastTime = new Date().getTime();
    this.timer = setInterval(loop, 0);
  }

  addFixedUpdate(f: FixedUpdate) {
    if (!this.fixedUpdates.includes(f)) {
      this.fixedUpdates.push(f);
    }
  }
}