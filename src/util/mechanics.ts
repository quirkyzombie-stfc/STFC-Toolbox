import { ShipType } from "./types";

export function getMitigationComponent(defenseValue: number, piercingValue: number): number {
  const x = defenseValue;
  const y = clamp(piercingValue, 0, Infinity);
  const pow = Math.pow;

  return 1 / (1 + pow(4, 1.1 - x / y));
}

export function clamp(x: number, min: number, max: number): number {
  return x < min ? min : x > max ? max : x;
}

export function getDMitigationComponent(defenseValue: number, piercingValue: number) {
  const x = defenseValue;
  const y = piercingValue;
  const a = 1.5;
  const b = -0.44581;
  const c = -3.19621;
  const d = 1;
  const pi = Math.PI;
  const sqrt = Math.sqrt;
  const exp = Math.exp;
  const sqr = (x: number) => x * x;
  const pow = Math.pow;

  // Cheers Wolfram Alpha
  // https://www.wolframalpha.com/input/?i=derivative+of+c+%2F+%28a+*+sqrt%282+*+pi%29%29+*+exp%28-0.5+*+%28%28x%2Fy+-+b%29+%2F+a%29%5E2%29+%2B+d%3B
  const dMdX =
    (0.398942 * c * (b * y - x) * exp(-(0.5 * pow(x / y - b, 2)) / pow(a, 2))) /
    (pow(a, 3) * pow(y, 2));
  const dMdY =
    (0.398942 * c * x * (x - b * y) * exp(-(0.5 * pow(x / y - b, 2)) / pow(a, 2))) /
    (pow(a, 3) * pow(y, 3));
  return { dMdX, dMdY };
}

export function getMitigation(
  armor: number,
  shield: number,
  dodge: number,
  armorPiercing: number,
  shieldPiercing: number,
  accuracy: number,
  defenderType: ShipType,
): number {
  const ca = defenderType === "Battleship" ? 0.55 : defenderType === "Survey" ? 0.3 : 0.2;
  const cs = defenderType === "Explorer" ? 0.55 : defenderType === "Survey" ? 0.3 : 0.2;
  const cd = defenderType === "Interceptor" ? 0.55 : defenderType === "Survey" ? 0.3 : 0.2;
  const ma = getMitigationComponent(armor, armorPiercing);
  const ms = getMitigationComponent(shield, shieldPiercing);
  const md = getMitigationComponent(dodge, accuracy);
  return 1.0 - (1.0 - ca * ma) * (1.0 - cs * ms) * (1.0 - cd * md);
}

export function getDMitigation(
  armor: number,
  shield: number,
  dodge: number,
  armorPiercing: number,
  shieldPiercing: number,
  accuracy: number,
  defenderType: ShipType,
) {
  const ca = defenderType === "Battleship" ? 0.55 : defenderType === "Survey" ? 0.3 : 0.2;
  const cs = defenderType === "Explorer" ? 0.55 : defenderType === "Survey" ? 0.3 : 0.2;
  const cd = defenderType === "Interceptor" ? 0.55 : defenderType === "Survey" ? 0.3 : 0.2;
  const ma = getMitigationComponent(armor, armorPiercing);
  const ms = getMitigationComponent(shield, shieldPiercing);
  const md = getMitigationComponent(dodge, accuracy);
  const dMdA = getDMitigationComponent(armor, armorPiercing);
  const dMdS = getDMitigationComponent(shield, shieldPiercing);
  const dMdD = getDMitigationComponent(dodge, accuracy);

  const dMdDA = (1.0 - cs * ms) * (1.0 - cd * md) * (ca * dMdA.dMdX);
  const dMdPA = (1.0 - cs * ms) * (1.0 - cd * md) * (ca * dMdA.dMdY);
  const dMdDS = (1.0 - ca * ma) * (1.0 - cd * md) * (cs * dMdS.dMdX);
  const dMdPS = (1.0 - ca * ma) * (1.0 - cd * md) * (cs * dMdS.dMdY);
  const dMdDD = (1.0 - cs * ms) * (1.0 - ca * ma) * (ca * dMdD.dMdX);
  const dMdPD = (1.0 - cs * ms) * (1.0 - ca * ma) * (ca * dMdD.dMdY);
  return { dMdDA, dMdPA, dMdDS, dMdPS, dMdDD, dMdPD };
}
