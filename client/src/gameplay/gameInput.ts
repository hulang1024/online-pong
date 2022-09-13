import KeyboardKey, { fromKeyboardEvent } from "../input/keyboardKey";
import ButtonStates from "../shared/game/input/buttonStates";
import GameButton from "../shared/game/input/gameButton";

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

// 游戏全局输入状态
class GameInputStates extends ButtonStates<GameButton> {
  private buttonListeners: ButtonListener[] = [];

  private lastPressedButtons: GameButton[] = [];

  constructor() {
    super();

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
    this.pressedButtons = [];
    this.lastPressedButtons = [];
  }
  
  hasChanged() {
    let changed: boolean | null = null;
    if (this.lastPressedButtons.length == this.pressedButtons.length) {
      for (let i = 0; i < this.pressedButtons.length; i++) {
        if (this.lastPressedButtons[i] != this.pressedButtons[i]) {
          changed = true;
          break;
        }
      }
      if (changed !== null) {
        changed = false;
      }
    } else {
      changed = true;
    }

    if (changed) {
      this.lastPressedButtons = [...this.pressedButtons];
    }

    return changed;
  }

  onButton(cb: ButtonListener) {
    this.buttonListeners.push(cb);
  }
}

const GameInput = new GameInputStates();
export default GameInput;
