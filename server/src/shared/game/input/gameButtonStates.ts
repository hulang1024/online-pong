import ButtonStates from "./buttonStates";
import GameButton from "./gameButton";

export default class GameButtonStates implements ButtonStates<GameButton> {
  /* private */ states = 0;

  constructor(val: any) {
    if (typeof val == 'number') {
      this.states = val;
    }
  }

  hasAnyButtonPressed(): boolean {
    return this.states != 0;
  }

  isPressed(button: GameButton): boolean {
    return (this.states & button) != 0;
  }

  setPressed(button: GameButton, pressed: boolean): boolean {
    if (((this.states & button) != 0) == pressed) {
      return false;
    }
    if (pressed) {
      this.states |= button;
    } else {
      this.states &= ~button;
    }
    return true;
  }

  reset() {
    this.states = 0;
  }

  equals(other: any) {
    if (typeof other == 'number')
      return this.states == other;
    else if (other instanceof GameButtonStates)
      return this.states == other.states;
    return false;
  }

  clone() {
    return new GameButtonStates(this.states);
  }
}
