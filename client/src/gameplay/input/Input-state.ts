import InputKey from "./input-key";

export default class InputState {
  static readonly EMPTY = Object.freeze(new InputState());

  readonly pressedKeys: Set<InputKey>;

  constructor(pressedKeys: InputKey[] = []) {
    this.pressedKeys = new Set<InputKey>(pressedKeys);
  }

  isPressed(key: InputKey) {
    return this.pressedKeys.has(key);
  }

  isPressedAny(keys: InputKey[]) {
    return keys.find(k => this.pressedKeys.has(k));
  }

  release(key: InputKey) {
    return this.pressedKeys.delete(key);
  }
}