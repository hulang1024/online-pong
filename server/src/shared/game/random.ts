import seedrandom from "seedrandom";

let prng: any;

export function initRandomSeed(seed: any) {
  prng = new (seedrandom as any)(seed);
}

export function random() {
  return prng();
}

export function randomRange(min: number, max: number) {
  return random() * (max - min) + min;
}