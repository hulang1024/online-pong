
type FixedUpdate = (delta: number) => void;

export interface FixedUpdatable {
  msPerFrame: number;
  fixedUpdate: FixedUpdate;
}


export default class MainLoop {
  private timer: NodeJS.Timer | null = null;
  private objects: FixedUpdatable[] = [];
  private fixedUpdates: FixedUpdate[] = [];
  // 固定更新时长（与FixedUpdatable同索引访问）
  private msPerFrames: number[] = [];
  // 游戏时间相对于实际时间的延迟
  private lags: number[] = [];

  restart() {
    this.stopLoop();
    this.startLoop();
  }

  private stopLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  startLoop() {
    if (this.timer) {
      return;
    }

    let nowTime = 0;
    let lastTime = 0;
    let elapsed = 0;

    const { fixedUpdates, msPerFrames, lags } = this;
    const loop = () => {
      nowTime = new Date().getTime();
      elapsed = nowTime - lastTime;
      lastTime = nowTime;

      let cnt = fixedUpdates.length;
      for (let i = 0; i < cnt; i++) {
        lags[i] += elapsed;
        while (lags[i] >= msPerFrames[i]) {
          fixedUpdates[i](msPerFrames[i]);
          lags[i] -= msPerFrames[i];
        }
      }
    };

    lastTime = new Date().getTime();
    this.timer = setInterval(loop, 0);
  }

  add(o: FixedUpdatable) {
    if (!this.objects.includes(o)) {
      this.objects.push(o);
      this.fixedUpdates.push(o.fixedUpdate.bind(o));
      this.msPerFrames.push(o.msPerFrame);
      this.lags.push(0);
      this.startLoop();
    }
  }

  remove(o: FixedUpdatable) {
    const i = this.objects.indexOf(o);
    if (i >= 0) {
      this.objects.slice(i, 1);
      this.fixedUpdates.splice(i, 1);
      this.msPerFrames.slice(i, 1);
      this.lags.slice(i, 1);
      if (!this.fixedUpdates.length) {
        this.stopLoop();
      }
    }
  }

  setMSPerFrame(o: FixedUpdatable, msPerFrame: number) {
    const i = this.fixedUpdates.indexOf(o.fixedUpdate);
    if (i > 0) {
      o.msPerFrame = msPerFrame;
      this.msPerFrames[i] = msPerFrame;
    }
  }
}
