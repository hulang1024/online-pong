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

    const loop = () => {
      for (let i = 0; i < this.objects.length; i++) {
        this.objects[i].fixedUpdate(delta);
      }
    };

    this.timer = setInterval(loop, delta);
  }

  add(o: FixedUpdatable) {
    this.objects.push(o);
  }

  remove(o: FixedUpdatable) {
    const i = this.objects.indexOf(o);
    i >= 0 && this.objects.splice(i, 1);
  }
}

export interface FixedUpdatable {
  fixedUpdate(delta: number): void;
}