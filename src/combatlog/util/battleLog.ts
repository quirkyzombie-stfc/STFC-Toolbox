import { BattleLogEvents } from "./constants";

// ----------------------------------------------------------------------------
// Battle log parsing
// ----------------------------------------------------------------------------

export interface CombatLogRound {
  hullRepairs: CombatLogHullRepair[];
  subRounds: CombatLogSubRound[];
}

export interface CombatLogHullRepair {
  ship: number;
  hull_repaired: number;
}

export interface CombatLogSubRound {
  events: CombatLogRoundEvent[];
}

export interface CombatLogRoundEventAttack {
  type: "attack";
  ship: number;
  weapon: number;
  target: number;
  accuracy: number;
  dodge: number;
  missed: number;
  crit: boolean;
  damage_mitigated: number;
  damage_taken_hull: number;
  damage_taken_shield: number;
  remaining_hull: number;
  remaining_shield: number;
  damage_iso: number;
  damage_iso_mitigated: number;
  triggers: CombatLogRoundEventAbility[];
}

export interface CombatLogRoundEventWeaponCharge {
  type: "charge";
  ship: number;
  weapon: number;
  charge: number;
}

export interface CombatLogRoundEventAbility {
  type: "ability";
  ship: number;
  officer: number;
  ability: number;
  value: number;
}

export type CombatLogRoundEvent =
  | CombatLogRoundEventAttack
  | CombatLogRoundEventWeaponCharge
  | CombatLogRoundEventAbility;

class InputStream<T> {
  public i: number = 0;
  constructor(public data: T[]) {}

  public peek(): T {
    if (!this.hasMoreData) this.unexpectedEndOfInput();
    return this.data[this.i];
  }
  public read(): T {
    if (!this.hasMoreData) this.unexpectedEndOfInput();
    return this.data[this.i++];
  }
  public readLiteral(expected: T) {
    if (this.data[this.i] === expected) {
      this.i++;
    } else {
      this.unexpectedElement();
    }
  }
  public readAnyLiteral(expectedOneOf: T[]) {
    if (expectedOneOf.includes(this.data[this.i])) {
      this.i++;
    } else {
      this.unexpectedElement();
    }
  }
  public hasMoreData(): boolean {
    return this.i < this.data.length;
  }
  public unexpectedElement(): never {
    throw new Error(`Unexpected element ${this.data[this.i]} at position ${this.i}`);
  }
  public unexpectedEndOfInput(): never {
    throw new Error(`Unexpected end of input`);
  }
}

function parseRound(input: InputStream<number>): CombatLogRound {
  const result: CombatLogRound = { subRounds: [], hullRepairs: [] };

  input.readLiteral(BattleLogEvents.START_ROUND);

  while (true) {
    const x = input.peek();
    if (x === BattleLogEvents.START_SUB_ROUND) {
      result.subRounds.push(parseSubRound(input));
    } else if (x === BattleLogEvents.HULL_REPAIR_START) {
      result.hullRepairs.push(parseHullRepair(input));
    } else if (x === BattleLogEvents.END_ROUND) {
      input.readLiteral(BattleLogEvents.END_ROUND);
      return result;
    } else {
      input.unexpectedElement();
    }
  }
}

function parseHullRepair(input: InputStream<number>): CombatLogHullRepair {
  input.readLiteral(BattleLogEvents.HULL_REPAIR_START);
  const result: CombatLogHullRepair = {
    ship: input.read(),
    hull_repaired: input.read(),
  };
  input.readLiteral(BattleLogEvents.HULL_REPAIR_END);
  return result;
}

function parseSubRound(input: InputStream<number>): CombatLogSubRound {
  const result: CombatLogSubRound = { events: [] };

  input.readLiteral(BattleLogEvents.START_SUB_ROUND);

  let subject: number = -1;
  while (true) {
    const x = input.peek();
    if (x === BattleLogEvents.END_SUB_ROUND) {
      input.readLiteral(BattleLogEvents.END_SUB_ROUND);
      return result;
    } else if (x === BattleLogEvents.OFFICER_ABILITIES_APPLIED_START) {
      result.events.push(...parseAbilities(input));
    } else if (x === BattleLogEvents.FORBIDDEN_TECH_BUFFS_APPLIED_START) {
      result.events.push(...parseAbilities(input));
    } else if (x === BattleLogEvents.START_ATTACK) {
      result.events.push(parseAttack(input, subject));
    } else if (x >= 0) {
      // Note: ship ID can be 0 for NPCs
      subject = input.read();
    } else {
      input.unexpectedElement();
    }
  }
}

function parseAbilities(input: InputStream<number>): CombatLogRoundEventAbility[] {
  const result: CombatLogRoundEventAbility[] = [];
  const blockStartTags = [
    BattleLogEvents.OFFICER_ABILITIES_APPLIED_START,
    BattleLogEvents.FORBIDDEN_TECH_BUFFS_APPLIED_START,
    BattleLogEvents.OFFICER_ABILITIES_FIRING,
  ];
  const blockEndTags = [
    BattleLogEvents.OFFICER_ABILITIES_APPLIED_END,
    BattleLogEvents.FORBIDDEN_TECH_BUFFS_APPLIED_END,
    BattleLogEvents.OFFICER_ABILITIES_FIRED,
  ];
  const abilityStartTags = [
    BattleLogEvents.OFFICER_ABILITY_START,
    BattleLogEvents.OFFICER_ABILITY_APPLIED_START,
    BattleLogEvents.FORBIDDEN_TECH_BUFF_APPLIED_START,
  ];
  input.readAnyLiteral(blockStartTags);

  let subject: number = -1;
  while (true) {
    const x = input.peek();
    if (blockEndTags.includes(x)) {
      input.readAnyLiteral(blockEndTags);
      return result;
    } else if (abilityStartTags.includes(x)) {
      result.push(parseAbility(input, subject));
    } else if (x >= 0) {
      subject = input.read();
    } else {
      input.unexpectedElement();
    }
  }
}

function parseAttack(
  input: InputStream<number>,
  subject: number,
): CombatLogRoundEventAttack | CombatLogRoundEventWeaponCharge {
  input.readLiteral(BattleLogEvents.START_ATTACK);
  const weapon = input.read();
  const target = input.peek();

  if (target === BattleLogEvents.ATTACK_CHARGE) {
    input.readLiteral(BattleLogEvents.ATTACK_CHARGE);
    const result: CombatLogRoundEventWeaponCharge = {
      type: "charge",
      ship: subject,
      weapon: weapon,
      charge: input.read(),
    };
    input.readLiteral(BattleLogEvents.END_ATTACK);
    return result;
  } else if (target >= 0) {
    const result: CombatLogRoundEventAttack = {
      type: "attack",
      ship: subject,
      weapon: weapon,
      target: input.read(),
      accuracy: input.read(),
      dodge: input.read(),
      missed: input.read(),
      crit: input.read() === 1,
      damage_taken_hull: input.read(),
      remaining_hull: input.read(),
      damage_taken_shield: input.read(),
      remaining_shield: input.read(),
      damage_mitigated: input.read(),
      damage_iso: input.read(),
      damage_iso_mitigated: input.read(),
      triggers: [],
    };
    if (input.peek() === BattleLogEvents.OFFICER_ABILITIES_FIRING) {
      result.triggers.push(...parseAbilities(input));
    }
    input.readLiteral(BattleLogEvents.END_ATTACK);
    return result;
  } else {
    input.unexpectedElement();
  }
}

function parseAbility(input: InputStream<number>, subject: number): CombatLogRoundEventAbility {
  input.readAnyLiteral([
    BattleLogEvents.OFFICER_ABILITY_START,
    BattleLogEvents.OFFICER_ABILITY_APPLIED_START,
    BattleLogEvents.FORBIDDEN_TECH_BUFF_APPLIED_START,
  ]);
  const result: CombatLogRoundEventAbility = {
    type: "ability",
    ship: subject,
    officer: input.read(),
    ability: input.read(),
    value: input.read(),
  };
  input.readAnyLiteral([
    BattleLogEvents.OFFICER_ABILITY_END,
    BattleLogEvents.OFFICER_ABILITY_APPLIED_END,
    BattleLogEvents.FORBIDDEN_TECH_BUFF_APPLIED_END,
  ]);
  return result;
}

export function parseBattleLog(data: number[]): CombatLogRound[] {
  const result: CombatLogRound[] = [];

  const input = new InputStream<number>(data);

  try {
    while (input.hasMoreData()) {
      const x = input.peek();
      if (x === BattleLogEvents.START_ROUND) {
        result.push(parseRound(input));
      } else {
        input.unexpectedElement();
      }
    }

    console.log(extractTags(data).join("\n"));
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function extractTags(data: number[]): string[] {
  var depth: number = 0;
  const indent = () => "  ".repeat(depth);
  const blockBegin = (tag: string) => {
    const result = indent() + tag;
    depth++;
    return result;
  };
  const blockEnd = (tag: string) => {
    depth--;
    return indent() + tag;
  };
  return data.map((x) => {
    if (x === BattleLogEvents.OFFICER_ABILITIES_APPLIED_START) {
      return blockBegin("OFFICER_ABILITIES_APPLIED_START");
    } else if (x === BattleLogEvents.OFFICER_ABILITIES_APPLIED_END) {
      return blockEnd("OFFICER_ABILITIES_APPLIED_END");
    } else if (x === BattleLogEvents.OFFICER_ABILITY_APPLIED_START) {
      return blockBegin("OFFICER_ABILITY_APPLIED_START");
    } else if (x === BattleLogEvents.OFFICER_ABILITY_APPLIED_END) {
      return blockEnd("OFFICER_ABILITY_APPLIED_END");
    } else if (x === BattleLogEvents.OFFICER_ABILITIES_FIRING) {
      return blockBegin("OFFICER_ABILITIES_FIRING");
    } else if (x === BattleLogEvents.OFFICER_ABILITIES_FIRED) {
      return blockEnd("OFFICER_ABILITIES_FIRED");
    } else if (x === BattleLogEvents.FORBIDDEN_TECH_BUFFS_APPLIED_END) {
      return blockEnd("FORBIDDEN_TECH_BUFFS_APPLIED_END");
    } else if (x === BattleLogEvents.FORBIDDEN_TECH_BUFFS_APPLIED_START) {
      return blockBegin("FORBIDDEN_TECH_BUFFS_APPLIED_START");
    } else if (x === BattleLogEvents.OFFICER_ABILITY_START) {
      return blockBegin("OFFICER_ABILITY_START");
    } else if (x === BattleLogEvents.OFFICER_ABILITY_END) {
      return blockEnd("OFFICER_ABILITY_END");
    } else if (x === BattleLogEvents.FORBIDDEN_TECH_BUFF_APPLIED_START) {
      return blockBegin("FORBIDDEN_TECH_BUFF_APPLIED_START");
    } else if (x === BattleLogEvents.FORBIDDEN_TECH_BUFF_APPLIED_END) {
      return blockEnd("FORBIDDEN_TECH_BUFF_APPLIED_END");
    } else if (x === BattleLogEvents.START_ATTACK) {
      return blockBegin("START_ATTACK");
    } else if (x === BattleLogEvents.END_ATTACK) {
      return blockEnd("END_ATTACK");
    } else if (x === BattleLogEvents.ATTACK_CHARGE) {
      return indent() + "ATTACK_CHARGE";
    } else if (x === BattleLogEvents.START_SUB_ROUND) {
      return blockBegin("START_SUB_ROUND");
    } else if (x === BattleLogEvents.END_SUB_ROUND) {
      return blockEnd("END_SUB_ROUND");
    } else if (x === BattleLogEvents.START_ROUND) {
      return blockBegin("START_ROUND");
    } else if (x === BattleLogEvents.END_ROUND) {
      return blockEnd("END_ROUND");
    } else if (x === BattleLogEvents.HULL_REPAIR_START) {
      return blockBegin("HULL_REPAIR_START");
    } else if (x === BattleLogEvents.HULL_REPAIR_END) {
      return blockEnd("HULL_REPAIR_END");
    } else {
      return indent() + x;
    }
  });
}
