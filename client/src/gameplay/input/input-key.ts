enum InputKey {
  Enter = 1,
  Space,
  Up, Right, Down, Left,
  Num0 = 48,
  Num1, Num2, Num3, Num4, Num5, Num6, Num7, Num8, Num9,
  A = 65,
  B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
};

export default InputKey;

export function fromKeyboardEvent(e: KeyboardEvent) {
  switch (e.key) {
    case 'Enter':
      return InputKey.Enter;
    case ' ':
      return InputKey.Space;
    case 'ArrowLeft':
      return InputKey.Left;
    case 'ArrowRight':
      return InputKey.Right;
    case 'ArrowUp':
      return InputKey.Up;
    case 'ArrowDown':
      return InputKey.Down;
  }
  if (e.key.length == 1) {
    let key = null;
    if ('0' <= e.key && e.key <= '9') {
      key = +e.key + 48;
    } else if ('a' <= e.key && e.key <= 'z') {
      key = e.key.charCodeAt(0) - 32;
    } else if ('A' <= e.key && e.key <= 'Z') {
      key = e.key.charCodeAt(0);
    }
    return key;
  }
  return null;
}