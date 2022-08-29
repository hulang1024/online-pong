import ButtonStates from "../input/button-states";
import KeyboardInput from "../input/keyboard-input";
import KeyboardKey from "../input/keyboard-key";

// 游戏按钮（逻辑按钮）
export enum GameButton {
  // 移动方向
  Up = 1, Right = 2, Down = 3, Left = 4,
  // 发球
  Serve
};

const state = new ButtonStates<GameButton>();

// 游戏全局输入
export default class GameInput {
  static readonly state = state;
  static {
    KeyboardInput.addKeyListener(
      (key) => {
        const btn = keyToButton(key);
        btn && state.setPressed(btn, true);
      },
      (key) => {
        const btn = keyToButton(key);
        btn && state.setPressed(btn, false);
      }
    );
    
    function keyToButton(key: KeyboardKey) {
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
        case KeyboardKey.Space:
          return GameButton.Serve;
      }
      return null;
    }
  }

  static hasAnyButtonPressed() {
    return state.hasAnyButtonPressed();
  }

  static isPressed(button: GameButton) {
    state.isPressed(button);
  }
}
