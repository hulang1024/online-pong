import Game from "../game";

export default abstract class Scene {
  readonly id: string;
  game: Game;
  constructor(id: string, game: Game) {
    this.id = id;
    this.game = game;
  }

  enter(args?: any): void {}
  exit(): void {}

  update(delta: number): void {}
  draw(): void {}
}

export class SceneManager {
  private sceneTable = new Map<string, Scene>();
  private _current: Scene;
  get current() { return this._current; }

  constructor(scenes: Scene[]) {
    scenes.forEach((scene) => {
      this.sceneTable.set(scene.id, scene);
    });
  }

  enter(sceneId: string, args?: any) {
    this._current?.exit();
    const toScene = this.sceneTable.get(sceneId);
    toScene.enter(args);
    this._current = toScene;
  }
}