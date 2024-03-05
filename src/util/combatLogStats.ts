import { CombatLog, CombatLogShip } from "./combatLog";

export interface Stats {
  min: number;
  max: number;
  sum: number;
  sum2: number;
  count: number;
  data: { t: number; value: number }[];
}

function emptyStats(): Stats {
  return {
    min: Infinity,
    max: -Infinity,
    sum: 0,
    sum2: 0,
    count: 0,
    data: [],
  };
}

function addSample(value: number, t: number, stats: Stats) {
  stats.min = Math.min(stats.min, value);
  stats.max = Math.max(stats.max, value);
  stats.count++;
  stats.sum += value;
  stats.sum2 += value * value;
  stats.data.push({ t, value });
}

function groupSamples(tMin: number, inputStats: Stats, stats: Stats) {
  const value = inputStats.data
    .filter((s) => s.t >= tMin)
    .map((s) => s.value)
    .reduce((p, c) => p + c, 0);
  stats.min = Math.min(stats.min, value);
  stats.max = Math.max(stats.max, value);
  stats.count++;
  stats.sum += value;
  stats.sum2 += value * value;
  stats.data.push({ t: tMin, value });
}

export interface WeaponStats {
  dprOut: Stats;
  dprIn: Stats;
  // Raw damage of all attacks
  totalRawDamageOut: Stats;
  totalRawDamageIn: Stats;
  // Raw damage of non-crits
  hitRawDamageOut: Stats;
  hitRawDamageIn: Stats;
  // Raw damage of crits
  critRawDamageOut: Stats;
  critRawDamageIn: Stats;
}

function emptyWeaponStats(): WeaponStats {
  return {
    dprOut: emptyStats(),
    dprIn: emptyStats(),
    totalRawDamageOut: emptyStats(),
    totalRawDamageIn: emptyStats(),
    hitRawDamageOut: emptyStats(),
    hitRawDamageIn: emptyStats(),
    critRawDamageOut: emptyStats(),
    critRawDamageIn: emptyStats(),
  };
}

export interface ShipStats {
  dprOut: Stats;
  dprIn: Stats;
  // Raw damage of all attacks
  totalRawDamageOut: Stats;
  totalRawDamageIn: Stats;
  // Raw damage of non-crits
  hitRawDamageOut: Stats;
  hitRawDamageIn: Stats;
  // Raw damage of crits
  critRawDamageOut: Stats;
  critRawDamageIn: Stats;
  // Mitigated damage
  mitigatedDamageOut: Stats;
  mitigatedDamageIn: Stats;
  // Mitigation (in percent)
  mitigationOut: Stats;
  mitigationIn: Stats;
  // Hull damage
  hullDamageOut: Stats;
  hullDamageIn: Stats;
  // Shield damage
  shieldDamageOut: Stats;
  shieldDamageIn: Stats;
  // Remaining hit points
  remainingHull: Stats;
  remainingShield: Stats;
  // Damage that did not originate from an attack (heal/burn effects)
  directDamageHull: Stats;
  directDamageShield: Stats;
  // Events
  roundShieldDepleted: number | undefined;
  roundDestroyed: number | undefined;
  // Per-weapon stats
  weapons: { [weaponId: string]: WeaponStats };
}

function emptyShipStats(): ShipStats {
  return {
    dprOut: emptyStats(),
    dprIn: emptyStats(),
    totalRawDamageOut: emptyStats(),
    totalRawDamageIn: emptyStats(),
    hitRawDamageOut: emptyStats(),
    hitRawDamageIn: emptyStats(),
    critRawDamageOut: emptyStats(),
    critRawDamageIn: emptyStats(),
    mitigatedDamageOut: emptyStats(),
    mitigatedDamageIn: emptyStats(),
    mitigationOut: emptyStats(),
    mitigationIn: emptyStats(),
    hullDamageOut: emptyStats(),
    hullDamageIn: emptyStats(),
    shieldDamageOut: emptyStats(),
    shieldDamageIn: emptyStats(),
    remainingHull: emptyStats(),
    remainingShield: emptyStats(),
    directDamageHull: emptyStats(),
    directDamageShield: emptyStats(),
    roundShieldDepleted: undefined,
    roundDestroyed: undefined,
    weapons: {},
  };
}

export type CombatLogStats = {
  ships: {
    [shipId: string]: ShipStats;
  };
};

export function gatherStats(log: CombatLog): CombatLogStats {
  const result: CombatLogStats = { ships: {} };
  log.ships.forEach((ship) => (result.ships[ship.ship_id] = emptyShipStats()));

  const hitPoints: { [shipId: string]: { shp: number; hhp: number } } = {};

  log.log.forEach((round, roundIndex) => {
    const tRound = roundIndex + 1;
    round.events.forEach((event, eventIndex) => {
      const t = roundIndex + 1 + eventIndex / round.events.length;
      switch (event.type) {
        case "attack":
          // Stats
          if (result.ships[event.ship] === undefined) {
            result.ships[event.ship] = emptyShipStats();
          }
          const attacker = result.ships[event.ship];

          if (result.ships[event.target] === undefined) {
            result.ships[event.target] = emptyShipStats();
          }
          const defender = result.ships[event.target];

          if (attacker.weapons[event.weapon] === undefined) {
            attacker.weapons[event.weapon] = emptyWeaponStats();
          }
          const weapon = attacker.weapons[event.weapon];

          // Compute attack properties
          const damage_total =
            event.damage_taken_hull + event.damage_taken_shield + event.damage_mitigated;
          const mitigation = event.damage_mitigated / damage_total;

          // Track hit points
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

            if (event.remaining_hull > 0) {
              addSample(-diffHhp, t, defender.directDamageHull);
            }
            if (event.remaining_shield > 0) {
              addSample(-diffShp, t, defender.directDamageShield);
            }
          }

          // Collect samples
          addSample(damage_total, t, attacker.totalRawDamageOut);
          addSample(damage_total, t, defender.totalRawDamageIn);
          addSample(damage_total, t, weapon.totalRawDamageOut);

          if (event.crit) {
            addSample(damage_total, t, attacker.critRawDamageOut);
            addSample(damage_total, t, defender.critRawDamageIn);
            addSample(damage_total, t, weapon.critRawDamageOut);
          } else {
            addSample(damage_total, t, attacker.hitRawDamageOut);
            addSample(damage_total, t, defender.hitRawDamageIn);
            addSample(damage_total, t, weapon.hitRawDamageOut);
          }

          addSample(event.damage_mitigated, t, attacker.mitigatedDamageOut);
          addSample(event.damage_mitigated, t, defender.mitigatedDamageIn);

          addSample(event.damage_taken_shield, t, attacker.shieldDamageOut);
          addSample(event.damage_taken_shield, t, defender.shieldDamageIn);

          addSample(event.damage_taken_hull, t, attacker.hullDamageOut);
          addSample(event.damage_taken_hull, t, defender.hullDamageIn);

          addSample(mitigation, t, attacker.mitigationOut);
          addSample(mitigation, t, defender.mitigationIn);

          addSample(event.remaining_hull, t, defender.remainingHull);
          addSample(event.remaining_shield, t, defender.remainingShield);

          if (event.remaining_shield === 0 && defender.roundShieldDepleted === undefined) {
            defender.roundShieldDepleted = roundIndex + 1;
          }
          if (event.remaining_hull === 0 && defender.roundDestroyed === undefined) {
            defender.roundDestroyed = roundIndex + 1;
          }
      }
    });
    log.ships.forEach((lship) => {
      const ship = result.ships[lship.ship_id];
      if (ship) {
        groupSamples(tRound, ship.totalRawDamageOut, ship.dprOut);
        groupSamples(tRound, ship.totalRawDamageIn, ship.dprIn);
      }
    });
  });

  return result;
}
