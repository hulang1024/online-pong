import Vector2 from "./vector";

export function checkCircleAndRectCollision(
  circle: { position: Vector2, radius: number },
  rect: { position: Vector2, width: number, height: number }
) {
  return (
    rect.position.x < circle.position.x + circle.radius &&
    rect.position.x + rect.width > circle.position.x - circle.radius &&
    rect.position.y < circle.position.y + circle.radius &&
    rect.position.y + rect.height > circle.position.y - circle.radius);
}