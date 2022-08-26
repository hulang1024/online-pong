export const InputKeys = {
  Enter: 'Enter',
  Space: 'Space',
  Left: 'Left',
  Right: 'Right',
  Up: 'Up',
  Down: 'Down',
};

for (let c = 48; c < 58; c++) {
  const key = String.fromCharCode(c);
  InputKeys['Num' + key] = key;
}
for (let c = 65; c < 91; c++) {
  const key = String.fromCharCode(c);
  InputKeys[key] = key;
}

function toInputKey(e) {
  switch (e.key) {
    case 'Enter':
      return InputKeys.Enter;
    case ' ':
      return InputKeys.Space;
    case 'ArrowLeft':
      return InputKeys.Left;
    case 'ArrowRight':
      return InputKeys.Right;
    case 'ArrowUp':
      return InputKeys.Up;
    case 'ArrowDown':
      return InputKeys.Down;
  }
  if (e.key.length == 1) {
    let key = null;
    if ('0' <= e.key && e.key <= '9') {
      key = InputKeys['Num' + e.key];
    } else {
      key = InputKeys[e.key.toUpperCase()];
    }
    return key;
  }
  return null;
}

const pressedListeners = new Set();
const releasedListeners = new Set();

const pressedKeys = [];

document.addEventListener('keydown', (e) => {
  const inputKey = toInputKey(e);
  if (inputKey && !pressedKeys.includes(inputKey)) {
    pressedKeys.push(inputKey);
    pressedListeners.forEach((l) => {
      l(inputKey);
    });
  }
});

document.addEventListener('keyup', (e) => {
  const inputKey = toInputKey(e);
  if (inputKey) {
    const i = pressedKeys.indexOf(inputKey);
    if (i > -1) {
      pressedKeys.splice(i, 1);
      releasedListeners.forEach((l) => {
        l(inputKey);
      });
    }
  }
});

const Input = {
  pressedKeys,
  addKeyListener(pressedL, releasedL) {
    if (pressedL) {
      pressedListeners.add(pressedL);
    }
    if (releasedL) {
      releasedListeners.add(releasedL);
    }
  },
  isPressed(key) {
    return pressedKeys.includes(key);
  },
  isPressedAny(InputKeys) {
    return InputKeys.find(k => pressedKeys.includes(k));
  },
  getPressedKeys() { return pressedKeys },
};

export default Input;