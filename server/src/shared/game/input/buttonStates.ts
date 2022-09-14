/**
 * 表示一组按钮按下的状态
 */
export default interface ButtonStates<TButton> {
  hasAnyButtonPressed(): boolean;

  isPressed(button: TButton): boolean;

  setPressed(button: TButton, pressed: boolean): boolean;

  reset(): void;

  equals(other: any): boolean;

  clone(): ButtonStates<TButton>;
}