/**
 * 表示一组按钮按下的状态
 */
export default class ButtonStates<TButton> {
  private pressedButtons: TButton[];

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
}