/**
 * 表示一组按钮按下的状态
 */
export default class ButtonStates<TButton> {
  protected pressedButtons: TButton[];

  static readonly EMPTY = Object.freeze(new ButtonStates());

  constructor(pressedButtons: TButton[] = []) {
    this.pressedButtons = pressedButtons;
  }

  hasAnyButtonPressed() {
    return this.pressedButtons.length > 0;
  }

  isPressed(button: TButton) {
    return this.pressedButtons.includes(button);
  }

  setPressed(button: TButton, pressed: boolean) {
    const i = this.pressedButtons.indexOf(button);
    if (i > -1 == pressed) {
      return false;
    }
    if (pressed) {
      this.pressedButtons.push(button);
    } else {
      this.pressedButtons.splice(i, 1);
    }
    return true;
  }

  reset() {
    this.pressedButtons = [];
  }

  equals(other: ButtonStates<TButton>) {
    if (!(other instanceof ButtonStates)) {
      return false;
    }
    if (this.pressedButtons.length == other.pressedButtons.length) {
      for (let i = 0; i < this.pressedButtons.length; i++) {
        if (this.pressedButtons[i] != other.pressedButtons[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  clone() {
    return new ButtonStates<TButton>([...this.pressedButtons]);
  }
}