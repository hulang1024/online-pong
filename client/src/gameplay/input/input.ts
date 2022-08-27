import InputKey, { fromKeyboardEvent } from "./input-key";
import InputState from "./Input-state";

type KeyListener = (key: InputKey) => void;

const pressedListeners = new Set<KeyListener>();
const releasedListeners = new Set<KeyListener>();
const inputState = new InputState();

document.addEventListener('keydown', (e) => {
  const key = fromKeyboardEvent(e);
  if (!key) {
    return;
  }
  if (!inputState.isPressed(key)) {
    inputState.pressedKeys.add(key);
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
  if (inputState.release(key)) {
    releasedListeners.forEach((l) => {
      l(key);
    });
  }
});

const Input = {
  state: inputState,
  isPressed: inputState.isPressed.bind(inputState),
  addKeyListener(pressedL: KeyListener, releasedL: KeyListener) {
    if (pressedL) {
      pressedListeners.add(pressedL);
    }
    if (releasedL) {
      releasedListeners.add(releasedL);
    }
  }
};
export default Input;