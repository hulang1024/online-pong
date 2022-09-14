import ButtonStates from "../input/buttonStates";
import KeyboardKey, { fromKeyboardEvent } from "./keyboardKey";

type KeyListener = (key: KeyboardKey) => void;

const pressedListeners: KeyListener[] = [];
const releasedListeners: KeyListener[] = [];
const keyStates = new ButtonStates<KeyboardKey>();

document.addEventListener('keydown', (e) => {
  const key = fromKeyboardEvent(e);
  if (!key) {
    return;
  }
  if (keyStates.setPressed(key, true)) {
    pressedListeners.forEach((l) => {
      l(key);
    });
  }
});

document.addEventListener('keyup', (e) => {
  const key = fromKeyboardEvent(e);
  if (!key) {
    return;
  }
  if (keyStates.setPressed(key, false)) {
    releasedListeners.forEach((l) => {
      l(key);
    });
  }
});

const KeyboardInput = {
  state: keyStates,
  isPressed: keyStates.isPressed.bind(keyStates),
  addKeyListener(pressedL: KeyListener, releasedL: KeyListener) {
    if (pressedL) {
      pressedListeners.push(pressedL);
    }
    if (releasedL) {
      releasedListeners.push(releasedL);
    }
  }
};
export default KeyboardInput;