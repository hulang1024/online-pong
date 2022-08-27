export default class MainLoop {
  private timer: NodeJS.Timer | null = null;
  private objects: FixedUpdatable[] = [];

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

    const delta = 1000 / 60;
    const { objects } = this;
    const loop = () => {
      for (let i = 0; i < objects.length; i++) {
        objects[i].fixedUpdate(delta);
      }
    };

    this.timer = setInterval(loop, delta);
  }

  add(o: FixedUpdatable) {
    if (!this.objects.includes(o)) {
      this.objects.push(o);
      this.startLoop();
    }
  }

  remove(o: FixedUpdatable) {
    const i = this.objects.indexOf(o);
    if (i >= 0) {
      this.objects.splice(i, 1);
      if (!this.objects.length) {
        this.stopLoop();
      }
    }
  }
}

export interface FixedUpdatable {
  fixedUpdate(delta: number): void;
}