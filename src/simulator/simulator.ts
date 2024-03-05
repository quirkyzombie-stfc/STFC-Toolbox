// ------------------------------------------------------------------------------------------------
// TODO:
// - Introduce temp hit point damage/heal (e.g., Leslie)
// - Add ship.forEachWeapon() (for things like Chen)
// - Add ship.modifyHHP() (for Leslie/Burning)
// - Add ship.modifySHP() (for Spock/Yuki)
// ------------------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------------------
// Interface
// ------------------------------------------------------------------------------------------------
export type ShipClass = "Explorer" | "Interceptor" | "Battleship" | "Survey" | "Structure";

export type DamageType = "Energy" | "Kinetic";

export type Stat =
  | "HHP"
  | "SHP"
  | "Armor"
  | "Shield"
  | "Dodge"
  | "ArmorPiercing"
  | "ShieldPiercing"
  | "Accuracy"
  | "ShieldAbsorption"
  | "Weapon1MinDamage"
  | "Weapon1MaxDamage"
  | "Weapon1Shots"
  | "Weapon1CritChance"
  | "Weapon1CritDamage"
  | "Weapon2MinDamage"
  | "Weapon2MaxDamage"
  | "Weapon2Shots"
  | "Weapon2CritChance"
  | "Weapon2CritDamage";

export const allStats: Stat[] = [
  "HHP",
  "SHP",
  "Armor",
  "Shield",
  "Dodge",
  "ArmorPiercing",
  "ShieldPiercing",
  "Accuracy",
  "ShieldAbsorption",
  "Weapon1MinDamage",
  "Weapon1MaxDamage",
  "Weapon1Shots",
  "Weapon1CritChance",
  "Weapon1CritDamage",
  "Weapon2MinDamage",
  "Weapon2MaxDamage",
  "Weapon2Shots",
  "Weapon2CritChance",
  "Weapon2CritDamage",
];

export type Side = "Attacker" | "Defender";

export type ConflictResolutionStrategy = "Replace" | "Ignore" | "Extend" | "Stack";

export interface CombatTime {
  round: number;
  attack: number;
}

/** [base, modifier, bonus] */
export type StatValue = [number, number, number];

export interface EffectData {
  name: string;
  stats: { [name in Stat]?: StatValue };
  duration?: number;
  onConflict?: ConflictResolutionStrategy;
}

export interface AbilityData {
  name: string;
  onInit?: string;
  onCombatStart?: string;
  onRoundStart?: string;
  onRoundEnd?: string;
  onAttackOut?: string;
  onAttackIn?: string;
}

export interface WeaponData {
  name: string;
  damageType: DamageType;
  load: number;
  reload: number;
}

export interface ShipData {
  name: string;
  side: Side;
  faction: string;
  shipClass: ShipClass;
  effects: EffectData[];
  abilities: AbilityData[];
  weapons: WeaponData[];
}

export interface CombatData {
  ships: ShipData[];
}

export interface ShipAPI {
  getShipClass(): ShipClass;
  getTarget(): ShipAPI | undefined;
  getStat(stat: Stat): number;
  addEffect(data: EffectData): void;
  hasEffect(name: string): boolean;
  remainingSHP(): number;
  remainingHHP(): number;
  remainingSHPPercent(): number;
  remainingHHPPercent(): number;
}

// ------------------------------------------------------------------------------------------------
// Mitigation math
// ------------------------------------------------------------------------------------------------
export function getMitigationComponent(defenseValue: number, piercingValue: number): number {
  return 1 / (1 + Math.pow(4, 1.1 - clamp(defenseValue / piercingValue, 0, Infinity)));
}

export function getMitigation(
  armor: number,
  shield: number,
  dodge: number,
  armorPiercing: number,
  shieldPiercing: number,
  accuracy: number,
  defenderType: ShipClass,
): number {
  const ca =
    defenderType === "Battleship"
      ? 0.55
      : defenderType === "Survey" || defenderType === "Structure"
        ? 0.3
        : 0.2;
  const cs =
    defenderType === "Explorer"
      ? 0.55
      : defenderType === "Survey" || defenderType === "Structure"
        ? 0.3
        : 0.2;
  const cd =
    defenderType === "Interceptor"
      ? 0.55
      : defenderType === "Survey" || defenderType === "Structure"
        ? 0.3
        : 0.2;
  const ma = getMitigationComponent(armor, armorPiercing);
  const ms = getMitigationComponent(shield, shieldPiercing);
  const md = getMitigationComponent(dodge, accuracy);
  return 1.0 - (1.0 - ca * ma) * (1.0 - cs * ms) * (1.0 - cd * md);
}

export function clamp(x: number, min: number, max: number): number {
  return x < min ? min : x > max ? max : x;
}

// ------------------------------------------------------------------------------------------------
// Implementation
// ------------------------------------------------------------------------------------------------
export interface Effect2 {
  name: string;

  onInit: AbilityEventHandler;
  onCombatStart: AbilityEventHandler;
  onRoundStart: AbilityEventHandler;
  onRoundEnd: AbilityEventHandler;
  onAttackOut: AbilityEventHandler;
  onAttackIn: AbilityEventHandler;
}

export class Effect {
  name: string;
  stats: { [name in Stat]?: StatValue };
  duration: number;
  onConflict: ConflictResolutionStrategy;

  constructor(data: EffectData) {
    this.name = data.name;
    this.stats = data.stats;
    this.duration = data.duration ?? Infinity;
    this.onConflict = data.onConflict ?? "Ignore";
  }

  public onRoundEnd() {
    this.duration -= 1;
  }

  public expired() {
    return this.duration <= 0;
  }

  public stack(other: Effect) {
    for (const key in other.stats) {
      const statName = key as Stat;
      const stat = this.stats[statName];
      const otherStat = other.stats[statName] as StatValue;
      if (stat) {
        stat[0] = stat[0] + otherStat[0];
        stat[1] = stat[1] + otherStat[1];
        stat[2] = stat[2] + otherStat[2];
      } else {
        this.stats[statName as Stat] = [...otherStat] as StatValue;
      }
    }
  }

  public extend(other: Effect) {
    this.duration += other.duration;
  }

  public replace(other: Effect) {
    this.stats = { ...other.stats };
    this.duration = other.duration;
    this.onConflict = other.onConflict;
  }
}

export type AbilityEventHandler = (
  ship: Ship,
  time: CombatTime,
  attack: AttackInfo | undefined,
) => void;

export class Ability {
  name: string;
  onInit: AbilityEventHandler;
  onCombatStart: AbilityEventHandler;
  onRoundStart: AbilityEventHandler;
  onRoundEnd: AbilityEventHandler;
  onAttackOut: AbilityEventHandler;
  onAttackIn: AbilityEventHandler;

  private createHandler(code?: string): AbilityEventHandler {
    return code ? (new Function("ship", "time", "attack", code) as AbilityEventHandler) : () => {};
  }

  constructor(data: AbilityData) {
    this.name = data.name;
    this.onInit = this.createHandler(data.onInit);
    this.onCombatStart = this.createHandler(data.onCombatStart);
    this.onRoundStart = this.createHandler(data.onRoundStart);
    this.onRoundEnd = this.createHandler(data.onRoundEnd);
    this.onAttackOut = this.createHandler(data.onAttackOut);
    this.onAttackIn = this.createHandler(data.onAttackIn);
  }
}

export class Weapon {
  name: string;
  damageType: DamageType;
  load: number;
  reload: number;
  nextAttack: number;

  constructor(data: WeaponData) {
    this.name = data.name;
    this.damageType = data.damageType;
    this.load = data.load;
    this.reload = data.reload;
    this.nextAttack = data.load;
  }
}

export class Ship implements ShipAPI {
  name: string;
  side: Side;
  faction: string;
  shipClass: ShipClass;
  effects: Effect[];
  abilities: Ability[];
  weapons: Weapon[];

  target?: Ship = undefined;
  shieldDepleted: boolean = false;
  destroyed: boolean = false;
  hullDamage: number = 0;
  shieldDamage: number = 0;

  fleet?: Fleet;
  targetFleet?: Fleet;

  private _stats: { [name in Stat]?: number } = {};

  constructor(data: ShipData) {
    this.name = data.name;
    this.side = data.side;
    this.faction = data.faction;
    this.shipClass = data.shipClass;
    this.effects = data.effects.map((data) => new Effect(data));
    this.abilities = data.abilities.map((data) => new Ability(data));
    this.weapons = data.weapons.map((data) => new Weapon(data));
    this.recomputeAllStats();
  }

  public getShipClass(): ShipClass {
    return this.shipClass;
  }

  public getTarget(): ShipAPI | undefined {
    return this.target;
  }

  public getStat(stat: Stat): number {
    const data = this._stats[stat];
    return data || 0;
  }

  private recomputeStat(stat: Stat) {
    const acc = this.effects.reduce<StatValue>(
      (acc, e) => {
        const value = e.stats[stat];
        if (value !== undefined) {
          return [acc[0] + value[0], acc[1] + value[1], acc[2] + value[2]];
        } else {
          return acc;
        }
      },
      [0, 0, 0],
    );
    this._stats[stat] = acc[0] * (1 + acc[1]) + acc[2];
  }

  private recomputeAllStats() {
    allStats.forEach((stat) => this.recomputeStat(stat));
  }

  public addEffect(data: EffectData) {
    const newEffect = new Effect(data);
    const existing = this.effects.find((eff) => eff.name === newEffect.name);
    if (existing) {
      switch (newEffect.onConflict) {
        case "Ignore":
          break;
        case "Replace":
          existing.replace(newEffect);
          break;
        case "Extend":
          existing.extend(newEffect);
          break;
        case "Stack":
          existing.stack(newEffect);
          break;
      }
    } else {
      this.effects.push(newEffect);
    }
    // TODO: Optimize
    this.recomputeAllStats();
  }

  public removeEffects() {
    const before = this.effects.length;
    this.effects = this.effects.filter((effect) => !effect.expired());
    if (this.effects.length !== before) {
      // TODO: Optimize
      this.recomputeAllStats();
    }
  }

  public hasEffect(name: string) {
    return this.effects.some((eff) => eff.name === name);
  }

  public remainingSHP(): number {
    return this.getStat("SHP") - this.shieldDamage;
  }

  public remainingHHP(): number {
    return this.getStat("HHP") - this.hullDamage;
  }

  public remainingSHPPercent(): number {
    return clamp(1 - this.shieldDamage / this.getStat("SHP"), 0, 1);
  }

  public remainingHHPPercent(): number {
    return clamp(1 - this.hullDamage / this.getStat("HHP"), 0, 1);
  }

  public weaponCount(): number {
    return this.weapons.length;
  }

  public nextAttack(weapon: number): number {
    return this.weapons[weapon - 1]?.nextAttack || Infinity;
  }

  public hasWeapon(weapon: number): boolean {
    return this.weapons.length >= weapon;
  }

  public alive(): boolean {
    return !this.destroyed;
  }

  public selectTarget(candidates: Ship[]): Ship | undefined {
    if (candidates.length > 0) {
      this.target = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      this.target = undefined;
    }
    return this.target;
  }
}

export class Fleet {
  ships: Ship[];

  constructor(ships: Ship[]) {
    this.ships = ships;
  }

  public alive(): boolean {
    return this.ships.length > 0;
  }

  public removeDeadShips() {
    this.ships = this.ships.filter((ship) => ship.alive());
  }

  public addEffect(data: EffectData) {
    this.ships.forEach((ship) => ship.addEffect(data));
  }
}

export interface CombatOutcome {
  rounds: number;
  attackerWin: number;
  attackerLosses: number;
  attackerShieldDamage: number;
  attackerHullDamage: number;
  defenderWin: number;
  defenderLosses: number;
  defenderShieldDamage: number;
  defenderHullDamage: number;
}

export interface AttackInfo {
  weapon: string;
  damageType: DamageType;
  attacker: Ship;
  target: Ship;
  shots: number;
  crits: number;
  mitigatedDamage: number;
  shieldDamage: number;
  hullDamage: number;
  shieldDepleted: boolean;
  destroyed: boolean;
}

export class Combat {
  enableLog: boolean;
  combatLog: string;
  ships: Ship[];
  attackerFleet: Fleet;
  defenderFleet: Fleet;

  constructor(data: CombatData, enableLog: boolean) {
    this.enableLog = enableLog;
    this.combatLog = "";
    this.ships = data.ships.map((data) => new Ship(data));
    this.attackerFleet = new Fleet(this.ships.filter((ship) => ship.side === "Attacker"));
    this.defenderFleet = new Fleet(this.ships.filter((ship) => ship.side === "Defender"));

    this.attackerFleet.ships.forEach((ship) => {
      ship.fleet = this.attackerFleet;
      ship.targetFleet = this.defenderFleet;
    });
    this.defenderFleet.ships.forEach((ship) => {
      ship.fleet = this.defenderFleet;
      ship.targetFleet = this.attackerFleet;
    });
  }

  private getMitigation(attacker: Ship, defender: Ship): number {
    return getMitigation(
      defender.getStat("Armor"),
      defender.getStat("Shield"),
      defender.getStat("Dodge"),
      attacker.getStat("ArmorPiercing"),
      attacker.getStat("ShieldPiercing"),
      attacker.getStat("Accuracy"),
      defender.shipClass,
    );
  }

  private init(time: CombatTime) {
    this.ships.forEach((ship) => ship.selectTarget(ship.targetFleet!.ships));
    this.ships.forEach((ship) =>
      ship.abilities.forEach((ability) => ability.onInit(ship, time, undefined)),
    );
  }

  private combatStart(time: CombatTime) {
    this.ships.forEach((ship) =>
      ship.abilities.forEach((ability) => ability.onCombatStart(ship, time, undefined)),
    );
  }

  private roundStart(time: CombatTime) {
    this.ships.forEach((ship) =>
      ship.abilities.forEach((ability) => ability.onRoundStart(ship, time, undefined)),
    );
  }

  private roundEnd(time: CombatTime) {
    this.ships.forEach((ship) => ship.effects.forEach((effect) => effect.onRoundEnd()));
    this.ships.forEach((ship) =>
      ship.abilities.forEach((ability) => ability.onRoundEnd(ship, time, undefined)),
    );
    this.ships.forEach((ship) => ship.removeEffects());
  }

  private attack(time: CombatTime) {
    this.ships.forEach((ship) => {
      // Select a target to attack
      const targetFleet = ship.side === "Attacker" ? this.defenderFleet : this.attackerFleet;
      const target = ship.selectTarget(targetFleet.ships);

      // Perform the attack
      if (ship.destroyed) {
        if (this.enableLog) {
          // this.combatLog += `${ship.name} can't attack because it is destroyed\n`;
        }
      } else if (!ship.hasWeapon(time.attack)) {
        if (this.enableLog) {
          // this.combatLog += `${ship.name} does not have weapon ${time.attack}\n`;
        }
      } else if (ship.nextAttack(time.attack) > time.round) {
        if (this.enableLog) {
          this.combatLog += `${ship.name} is reloading weapon ${time.attack} (${
            ship.nextAttack(time.attack) - time.round
          } rounds left)\n`;
        }
      } else if (target === undefined) {
        if (this.enableLog) {
          // this.combatLog += `${ship.name} does not have anything to attack\n`;
        }
      } else {
        const weapon = ship.weapons[time.attack - 1];
        const shotCount = clamp(
          Math.round(ship.getStat(("Weapon" + time.attack + "Shots") as Stat)),
          0,
          Infinity,
        );
        const minDamage = clamp(
          ship.getStat(("Weapon" + time.attack + "MinDamage") as Stat),
          0,
          Infinity,
        );
        const maxDamage = clamp(
          ship.getStat(("Weapon" + time.attack + "MaxDamage") as Stat),
          0,
          Infinity,
        );
        const critChance = clamp(
          ship.getStat(("Weapon" + time.attack + "CritChance") as Stat),
          0,
          1,
        );
        const critDamage = clamp(
          ship.getStat(("Weapon" + time.attack + "CritDamage") as Stat),
          0,
          Infinity,
        );
        const shieldAbsorption = clamp(target.getStat("ShieldAbsorption"), 0, 1);
        const mitigation = this.getMitigation(ship, target);

        const attackInfo: AttackInfo = {
          weapon: weapon.name,
          damageType: weapon.damageType,
          shots: shotCount,
          attacker: ship,
          target: target,
          crits: 0,
          mitigatedDamage: 0,
          shieldDamage: 0,
          hullDamage: 0,
          shieldDepleted: false,
          destroyed: false,
        };
        for (let s = 0; s < shotCount; ++s) {
          // Compute damage
          const crit = Math.random() < critChance;
          attackInfo.crits += crit ? 1 : 0;
          const totalDamage =
            (minDamage + Math.random() * (maxDamage - minDamage)) * (crit ? critDamage : 1);
          const mitigated = totalDamage * mitigation;
          attackInfo.mitigatedDamage += mitigated;
          const unmitigated = totalDamage - mitigated;

          // Apply damage
          if (target.remainingSHP() > 0) {
            target.shieldDamage += unmitigated * shieldAbsorption;
            target.hullDamage += unmitigated * (1 - shieldAbsorption);
            attackInfo.shieldDamage += unmitigated * shieldAbsorption;
            attackInfo.hullDamage += unmitigated * (1 - shieldAbsorption);
          } else {
            target.hullDamage += unmitigated;
            attackInfo.hullDamage += unmitigated;
          }

          if (!target.shieldDepleted && target.remainingSHP() <= 0) {
            attackInfo.shieldDepleted = true;
            target.shieldDepleted = true;
          }
          if (!target.destroyed && target.remainingHHP() <= 0) {
            attackInfo.destroyed = true;
            target.destroyed = true;
          }
        }

        // Combat log
        if (this.enableLog) {
          this.combatLog += `${ship.name} attacks ${shotCount}x ${target.name} using ${
            weapon.name
          }${
            attackInfo.crits > 0 ? ` (${attackInfo.crits}x critical)` : ""
          }. ${attackInfo.mitigatedDamage.toFixed(2)} mitigated, ${attackInfo.shieldDamage.toFixed(
            2,
          )} shield damage, ${attackInfo.hullDamage.toFixed(2)} hull damage. ${target
            .remainingSHP()
            .toFixed(2)} shield left, ${target.remainingHHP().toFixed(2)} hull left.\n`;
          if (attackInfo.shieldDepleted) {
            this.combatLog += `${target.name} shield depleted\n`;
          }
          if (attackInfo.destroyed) {
            this.combatLog += `${target.name} destroyed\n`;
          }
        }

        // Trigger abilities
        ship.abilities.forEach((ability) => ability.onAttackIn(ship, time, attackInfo));
        target.abilities.forEach((ability) => ability.onAttackIn(target, time, attackInfo));
        weapon.nextAttack = time.round + weapon.reload;

        // Remove dead ships
        if (attackInfo.destroyed) {
          this.attackerFleet.removeDeadShips();
          this.defenderFleet.removeDeadShips();
        }
      }
    });
  }

  public run(): CombatOutcome {
    const time = { round: 0, attack: 0 };
    const maxWeaponCount = this.ships.reduce((acc, ship) => Math.max(acc, ship.weaponCount()), 0);

    this.init(time);
    this.combatStart(time);
    while (time.round < 100 && this.attackerFleet.alive() && this.defenderFleet.alive()) {
      time.round++;
      time.attack = 0;
      if (this.enableLog) {
        this.combatLog += `Round ${time.round}\n`;
        this.combatLog += `===================\n`;
      }

      this.roundStart(time);
      while (time.attack < maxWeaponCount) {
        time.attack++;
        this.attack(time);
      }
      this.roundEnd(time);
      if (this.enableLog) {
        this.combatLog += `\n`;
      }
    }

    return {
      rounds: time.round,
      attackerWin: this.attackerFleet.alive() ? 1 : 0,
      attackerShieldDamage: this.ships
        .filter((ship) => ship.side === "Attacker")
        .reduce((acc, v) => acc + v.shieldDamage, 0),
      attackerHullDamage: this.ships
        .filter((ship) => ship.side === "Attacker")
        .reduce((acc, v) => acc + v.hullDamage, 0),
      attackerLosses: this.ships
        .filter((ship) => ship.side === "Attacker")
        .reduce((acc, v) => acc + (v.destroyed ? 1 : 0), 0),
      defenderWin: this.defenderFleet.alive() ? 1 : 0,
      defenderShieldDamage: this.ships
        .filter((ship) => ship.side === "Defender")
        .reduce((acc, v) => acc + v.shieldDamage, 0),
      defenderHullDamage: this.ships
        .filter((ship) => ship.side === "Defender")
        .reduce((acc, v) => acc + v.hullDamage, 0),
      defenderLosses: this.ships
        .filter((ship) => ship.side === "Defender")
        .reduce((acc, v) => acc + (v.destroyed ? 1 : 0), 0),
    };
  }
}

export interface CombatSimulatorResult {
  simulationDuration: number;
  iterations: number;
  averageOutcome: CombatOutcome;
  exampleLog: string;
}

// ------------------------------------------------------------------------------------------------
// Main
// ------------------------------------------------------------------------------------------------
export class CombatSimulator {
  static run(data: CombatData, iterations: number): CombatSimulatorResult {
    try {
      const begin = performance.now();
      let exampleLog = "";
      const results: CombatOutcome = {
        rounds: 0,
        attackerWin: 0,
        attackerLosses: 0,
        attackerShieldDamage: 0,
        attackerHullDamage: 0,
        defenderWin: 0,
        defenderLosses: 0,
        defenderShieldDamage: 0,
        defenderHullDamage: 0,
      };
      for (let i = 0; i < iterations; ++i) {
        console.info(`Running simulation i/${iterations}`);
        const combat = new Combat(data, i === 0);
        const result = combat.run();
        exampleLog += combat.combatLog;
        (Object.keys(results) as (keyof CombatOutcome)[]).forEach(
          (key) => (results[key] += (1 / iterations) * result[key]),
        );
      }
      const end = performance.now();
      const duration = end - begin;
      return {
        simulationDuration: duration,
        iterations: iterations,
        averageOutcome: results,
        exampleLog: exampleLog,
      };
    } catch (e) {
      return {
        simulationDuration: 0,
        iterations: 0,
        averageOutcome: {
          rounds: 0,
          attackerWin: 0,
          attackerLosses: 0,
          attackerShieldDamage: 0,
          attackerHullDamage: 0,
          defenderWin: 0,
          defenderLosses: 0,
          defenderShieldDamage: 0,
          defenderHullDamage: 0,
        },
        exampleLog: "" + e,
      };
    }
  }
}
