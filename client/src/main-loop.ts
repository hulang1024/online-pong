export default class MainLoop {
  objects: FixedUpdatable[] = [];

  start() {
    //let lastTime = 0;
    //let deltaTime;
    const { objects } = this;
    const loop = (nowTime: number) => {
      //deltaTime = (nowTime - lastTime) * 0.001;
      //lastTime = nowTime;
      for (let i = 0; i < objects.length; i++) {
        objects[i].fixedUpdate(0.01666);
      }
      requestAnimationFrame(loop); 
    };

    requestAnimationFrame((nowTime: number) => {
      //lastTime = nowTime;
      requestAnimationFrame(loop);
    });
  }
}

interface FixedUpdatable {
  fixedUpdate(delta: number): void;
}