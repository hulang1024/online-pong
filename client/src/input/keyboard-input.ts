import KeyboardKey, { fromKeyboardEvent } from "./keyboard-key";
import ButtonStates from "./button-states";

type KeyListener = (key: KeyboardKey) => void;

const pressedListeners = new Set<KeyListener>();
const releasedListeners = new Set<KeyListener>();
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
      pressedListeners.add(pressedL);
    }
    if (releasedL) {
      releasedListeners.add(releasedL);
    }
  }
};
export default KeyboardInput;