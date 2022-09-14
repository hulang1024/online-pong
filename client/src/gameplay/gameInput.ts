import KeyboardKey, { fromKeyboardEvent } from "../input/keyboardKey";
import GameButton from "../shared/game/input/gameButton";
import GameButtonStates from "../shared/game/input/gameButtonStates";

function fromKeyboardKey(key: KeyboardKey) {
  switch (key) {
    case KeyboardKey.Up:
    case KeyboardKey.W:
      return GameButton.Up;
    case KeyboardKey.Right:
    case KeyboardKey.D:
      return GameButton.Right;
    case KeyboardKey.Down:
    case KeyboardKey.S:
      return GameButton.Down;
    case KeyboardKey.Left:
    case KeyboardKey.A:
      return GameButton.Left;
    case KeyboardKey.Enter:
    case KeyboardKey.Space:
      return GameButton.Ok;
  }
  return null;
}

type ButtonListener = (btn: GameButton, down: boolean) => void;

class GameInputStates extends GameButtonStates {
  private buttonListeners: ButtonListener[] = [];
  private lastStates = 0;

  constructor() {
    super(0);
    document.addEventListener('keydown', (e) => {
      const btn = fromKeyboardKey(fromKeyboardEvent(e));
      if (btn && this.setPressed(btn, true)) {
        this.buttonListeners.forEach((cb) => {
          cb(btn, true);
        });
      }
    });
    document.addEventListener('keyup', (e) => {
      const btn = fromKeyboardKey(fromKeyboardEvent(e));
      if (btn && this.setPressed(btn, false)) {
        this.buttonListeners.forEach((cb) => {
          cb(btn, true);
        });
      }
    });
  }

  reset() {
    super.reset();
    this.lastStates = 0;
  }
  
  hasChanged() {
    let changed = this.states != this.lastStates;
    if (changed) {
      this.lastStates = this.states;
    }
    return changed;
  }

  onButton(cb: ButtonListener) {
    this.buttonListeners.push(cb);
  }
}

const GameInput = new GameInputStates();
export default GameInput;