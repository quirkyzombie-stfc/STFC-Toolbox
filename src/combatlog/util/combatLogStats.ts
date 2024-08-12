import { CombatLogParsedData, CombatLogRound, CombatLogShip } from "./combatLog";
import { lookupComponent, GameData } from "./combatLog";
import type { ShipComponentWeapon } from "../../util/gameData";

export interface CombatLogTime {
  round: number;
  subRound: number;
}

export interface DamageSample {
  tag: "damage";
  t: CombatLogTime;
  mitigation: number; // In percent
  hhp: number; // HHP damage
  shp: number; // SHP damage
  crit: boolean;
  damageMultiplier: number; // Total standard outgoing damage divided by expected weapon base damage
  std_damage: number; // Standard outgoing damage
  std_mitigated: number; // Standard damage mitigated
  iso_damage: number;
  iso_mitigated: number;
  apex_mitigated: number;
  base_min: number; // Base damage
  base_max: number; // Base damage
}

export interface HitPointSample {
  tag: "hp";
  t: CombatLogTime;
  hhp: number; // Remaining HHP
  shp: number; // Remaining SHP
}

export interface HitPointChangeSample {
  tag: "hp_change";
  t: CombatLogTime;
  diff: number;
}

export interface EmptyEventSample {
  tag: "empty";
  t: CombatLogTime;
}

export interface AbilityActivationSample {
  tag: "ability";
  t: CombatLogTime;
}

export type Sample =
  | DamageSample
  | HitPointSample
  | HitPointChangeSample
  | EmptyEventSample
  | AbilityActivationSample;

export interface Stats {
  min: number;
  max: number;
  sum: number;
  sum2: number;
  count: number;
}

function emptyStats(): Stats {
  return {
    min: Infinity,
    max: -Infinity,
    sum: 0,
    sum2: 0,
    count: 0,
  };
}

function addSample(value: number, stats: Stats): Stats {
  stats.min = Math.min(stats.min, value);
  stats.max = Math.max(stats.max, value);
  stats.count++;
  stats.sum += value;
  stats.sum2 += value * value;
  return stats;
}

export function getStats<S extends Sample>(
  samples: S[],
  filter: (s: S) => boolean,
  map: (s: S) => number,
): Stats {
  return samples
    .filter(filter)
    .map(map)
    .reduce<Stats>((acc, x) => addSample(x, acc), emptyStats());
}

export interface ShipStats {
  damageOut: DamageSample[];
  damageIn: DamageSample[];
  hitPoints: HitPointSample[];
  hhpChange: HitPointChangeSample[];
  shpChange: HitPointChangeSample[];
  hhpDepleted: EmptyEventSample[];
  shpDepleted: EmptyEventSample[];

  // Per-weapon stats
  weapons: { [weaponId: number]: DamageSample[] };
}

function emptyShipStats(): ShipStats {
  return {
    damageOut: [],
    damageIn: [],
    hitPoints: [],
    hhpChange: [],
    shpChange: [],
    hhpDepleted: [],
    shpDepleted: [],
    weapons: {},
  };
}

export type CombatLogStats = {
  ships: {
    [shipId: number]: ShipStats;
  };
};

function getShipStats(all: CombatLogStats, shipId: number) {
  if (all.ships[shipId] === undefined) {
    all.ships[shipId] = emptyShipStats();
  }
  return all.ships[shipId];
}
function getWeaponStats(all: CombatLogStats, shipId: number, weaponId: number) {
  const ship = getShipStats(all, shipId);
  if (ship.weapons[weaponId] === undefined) {
    ship.weapons[weaponId] = [];
  }
  return ship.weapons[weaponId];
}

export function gatherStats(
  allShips: CombatLogShip[],
  battleLog: CombatLogRound[],
  data: GameData,
): CombatLogStats {
  const result: CombatLogStats = { ships: {} };
  allShips.forEach((ship) => (result.ships[ship.shipId] = emptyShipStats()));

  const hitPoints: { [shipId: string]: { shp: number; hhp: number } } = {};

  battleLog.forEach((round, roundIndex) => {
    round.subRounds.forEach((subRound, subRoundIndex) => {
      const t: CombatLogTime = { round: roundIndex + 1, subRound: subRoundIndex + 1 };
      subRound.events.forEach((event) => {
        switch (event.type) {
          case "attack":
            const weaponComponent = lookupComponent(event.weapon, data)?.component.data as
              | ShipComponentWeapon
              | undefined;
            const damage_base_min = weaponComponent?.minimum_damage || 0;
            const damage_base_max = weaponComponent?.maximum_damage || 0;

            // Stats
            const attacker = getShipStats(result, event.ship);
            const defender = getShipStats(result, event.target);
            const weapon = getWeaponStats(result, event.ship, event.weapon);

            // Compute attack properties
            const damage_total =
              event.damage_taken_hull +
              event.damage_taken_shield +
              event.damage_mitigated +
              event.damage_iso_mitigated +
              event.damage_apex_mitigated;
            const mitigation = event.damage_mitigated / damage_total;

            // Damage
            const damageSample: DamageSample = {
              tag: "damage",
              t,
              std_damage: damage_total - event.damage_iso,
              iso_damage: event.damage_iso,
              mitigation,
              hhp: event.damage_taken_hull,
              shp: event.damage_taken_shield,
              crit: event.crit,
              damageMultiplier: damage_total / ((damage_base_min + damage_base_max) / 2),
              std_mitigated: event.damage_mitigated,
              iso_mitigated: event.damage_iso_mitigated,
              apex_mitigated: event.damage_apex_mitigated,
              base_min: damage_base_min,
              base_max: damage_base_max,
            };

            attacker.damageOut.push(damageSample);
            defender.damageIn.push(damageSample);
            weapon.push(damageSample);

            // Remaining hit points
            const hitPointSample: HitPointSample = {
              tag: "hp",
              t,
              hhp: event.remaining_hull,
              shp: event.remaining_shield,
            };
            defender.hitPoints.push(hitPointSample);

            // Non-attack hit point changes (need to track hit points)
            if (hitPoints[event.target] === undefined) {
              hitPoints[event.target] = {
                hhp: event.remaining_hull,
                shp: event.remaining_shield,
              };
            } else {
              const defenderHp = hitPoints[event.target];
              const diffHhp = defenderHp.hhp - event.remaining_hull - event.damage_taken_hull;
              const diffShp = defenderHp.shp - event.remaining_shield - event.damage_taken_shield;

              defenderHp.hhp = event.remaining_hull;
              defenderHp.shp = event.remaining_shield;

              if (diffHhp != 0) {
                const hhpChangeSample: HitPointChangeSample = {
                  tag: "hp_change",
                  t,
                  diff: -diffHhp,
                };
                defender.hhpChange.push(hhpChangeSample);
              }
              if (diffShp != 0) {
                const hhpChangeSample: HitPointChangeSample = {
                  tag: "hp_change",
                  t,
                  diff: -diffHhp,
                };
                defender.hhpChange.push(hhpChangeSample);
              }
            }

            // HP depleted events
            if (event.remaining_shield === 0 && event.damage_taken_shield > 0) {
              const shpDepletedSample: EmptyEventSample = {
                tag: "empty",
                t,
              };
              defender.shpDepleted.push(shpDepletedSample);
            }
            if (event.remaining_hull === 0 && event.damage_taken_hull > 0) {
              const hhpDepletedSample: EmptyEventSample = {
                tag: "empty",
                t,
              };
              defender.hhpDepleted.push(hhpDepletedSample);
            }
        }
      });
    });
  });

  return result;
}
